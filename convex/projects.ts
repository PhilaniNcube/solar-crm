import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const projects = query({
  args: {
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Fetch projects for the given organization slug
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("slug"), orgSlug))
      .collect();

    // Return projects with customer and quote information
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const customer = await ctx.db.get(project.customerId);
        const quote = await ctx.db.get(project.quoteId);

        return {
          ...project,
          customerName: customer ? customer.name : "Unknown Customer",
          customerType: customer ? customer.type : undefined,
          quoteVersion: quote ? quote.version : undefined,
          quoteTotal: quote ? quote.totalPrice : undefined,
        };
      })
    );

    // Sort projects by createdAt date in descending order
    projectsWithDetails.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime(); // Sort by most recent first
    });

    return projectsWithDetails;
  },
});

export const getProject = query({
  args: {
    projectId: v.id("projects"),
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { projectId, orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get the project
    const project = await ctx.db.get(projectId);
    if (!project) {
      return null;
    }

    // Verify it belongs to the organization
    if (project.slug !== orgSlug) {
      throw new Error("Project does not belong to this organization");
    }

    // Get related data
    const customer = await ctx.db.get(project.customerId);
    const quote = await ctx.db.get(project.quoteId);

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (!quote) {
      throw new Error("Quote not found");
    }

    // Get project tasks
    const tasks = await ctx.db
      .query("projectTasks")
      .filter((q) => q.eq(q.field("slug"), orgSlug))
      .filter((q) => q.eq(q.field("projectId"), projectId))
      .collect();

    return {
      ...project,
      customer,
      quote,
      tasks,
    };
  },
});

export const getProjectsByStatus = query({
  args: {
    orgSlug: v.string(),
    status: v.union(
      v.literal("planning"),
      v.literal("permitting"),
      v.literal("installing"),
      v.literal("commissioned"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const { orgSlug, status } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("slug"), orgSlug))
      .filter((q) => q.eq(q.field("status"), status))
      .collect();

    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const customer = await ctx.db.get(project.customerId);
        const quote = await ctx.db.get(project.quoteId);

        return {
          ...project,
          customerName: customer ? customer.name : "Unknown Customer",
          customerType: customer ? customer.type : undefined,
          quoteVersion: quote ? quote.version : undefined,
          quoteTotal: quote ? quote.totalPrice : undefined,
        };
      })
    );

    // Sort projects by createdAt date in descending order
    projectsWithDetails.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime(); // Sort by most recent first
    });

    return projectsWithDetails;
  },
});

export const getProjectStats = query({
  args: {
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("slug"), orgSlug))
      .collect();

    const stats = {
      total: projects.length,
      planning: 0,
      permitting: 0,
      installing: 0,
      commissioned: 0,
      completed: 0,
    };

    projects.forEach((project) => {
      stats[project.status]++;
    });

    return stats;
  },
});

export const createProject = mutation({
  args: {
    orgSlug: v.string(),
    userId: v.string(),
    quoteId: v.id("quotes"),
    customerId: v.id("customers"),
    status: v.optional(
      v.union(
        v.literal("planning"),
        v.literal("permitting"),
        v.literal("installing"),
        v.literal("commissioned"),
        v.literal("completed")
      )
    ),
    startDate: v.optional(v.string()),
    completionDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const {
      orgSlug,
      userId,
      quoteId,
      customerId,
      status = "planning",
      startDate,
      completionDate,
    } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Validate quote exists and belongs to organization
    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }
    if (quote.slug !== orgSlug) {
      throw new Error("Quote does not belong to this organization");
    }

    // Validate customer exists and belongs to organization
    const customer = await ctx.db.get(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }
    if (customer.slug !== orgSlug) {
      throw new Error("Customer does not belong to this organization");
    }

    // Ensure quote and customer match
    if (quote.customerId !== customerId) {
      throw new Error("Quote does not belong to the specified customer");
    }

    // Check if a project already exists for this quote
    const existingProject = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("slug"), orgSlug))
      .filter((q) => q.eq(q.field("quoteId"), quoteId))
      .first();

    if (existingProject) {
      throw new Error("A project already exists for this quote");
    }

    // Validate dates if provided
    if (startDate && completionDate) {
      const start = new Date(startDate);
      const completion = new Date(completionDate);
      if (completion <= start) {
        throw new Error("Completion date must be after start date");
      }
    }

    const projectId = await ctx.db.insert("projects", {
      slug: orgSlug,
      userId,
      quoteId,
      customerId,
      status,
      startDate,
      completionDate,
      createdAt: new Date().toISOString(),
    });

    return projectId;
  },
});

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    orgSlug: v.string(),
    userId: v.string(),
    status: v.optional(
      v.union(
        v.literal("planning"),
        v.literal("permitting"),
        v.literal("installing"),
        v.literal("commissioned"),
        v.literal("completed")
      )
    ),
    startDate: v.optional(v.string()),
    completionDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { projectId, orgSlug, userId, ...updates } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get the project
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Verify it belongs to the organization
    if (project.slug !== orgSlug) {
      throw new Error("Project does not belong to this organization");
    }

    // Validate dates if provided
    if (updates.startDate && updates.completionDate) {
      const start = new Date(updates.startDate);
      const completion = new Date(updates.completionDate);
      if (completion <= start) {
        throw new Error("Completion date must be after start date");
      }
    }

    // If setting completion date but no start date, ensure we have a start date
    if (updates.completionDate && !updates.startDate && !project.startDate) {
      throw new Error("Cannot set completion date without a start date");
    }

    // Auto-set completion date when status is set to completed
    if (
      updates.status === "completed" &&
      !updates.completionDate &&
      !project.completionDate
    ) {
      updates.completionDate = new Date().toISOString();
    }

    await ctx.db.patch(projectId, {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    });

    return projectId;
  },
});

export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { projectId, orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get the project
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Verify it belongs to the organization
    if (project.slug !== orgSlug) {
      throw new Error("Project does not belong to this organization");
    }

    // Delete all associated tasks first
    const tasks = await ctx.db
      .query("projectTasks")
      .filter((q) => q.eq(q.field("projectId"), projectId))
      .collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    // Delete the project
    await ctx.db.delete(projectId);
    return projectId;
  },
});

// Project Tasks CRUD Operations

export const getProjectTasks = query({
  args: {
    projectId: v.id("projects"),
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { projectId, orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Verify project exists and belongs to organization
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.slug !== orgSlug) {
      throw new Error("Project does not belong to this organization");
    }

    const tasks = await ctx.db
      .query("projectTasks")
      .filter((q) => q.eq(q.field("slug"), orgSlug))
      .filter((q) => q.eq(q.field("projectId"), projectId))
      .collect();

    // Sort tasks by due date, completed tasks last
    tasks.sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
      const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);

      // If both tasks are completed, sort by due date
      if (a.isCompleted && b.isCompleted) {
        return dateA.getTime() - dateB.getTime();
      }

      // If only one task is completed, it goes last
      if (a.isCompleted) return 1;
      if (b.isCompleted) return -1;

      // Otherwise, sort by due date
      return dateA.getTime() - dateB.getTime();
    });

    return tasks;
  },
});

export const createProjectTask = mutation({
  args: {
    orgSlug: v.string(),
    userId: v.string(),
    projectId: v.id("projects"),
    title: v.string(),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { orgSlug, userId, projectId, title, dueDate } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Verify project exists and belongs to organization
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.slug !== orgSlug) {
      throw new Error("Project does not belong to this organization");
    }

    const taskId = await ctx.db.insert("projectTasks", {
      slug: orgSlug,
      userId,
      projectId,
      title,
      isCompleted: false,
      dueDate,
      createdAt: new Date().toISOString(),
    });

    return taskId;
  },
});

export const updateProjectTask = mutation({
  args: {
    taskId: v.id("projectTasks"),
    orgSlug: v.string(),
    userId: v.string(),
    title: v.optional(v.string()),
    isCompleted: v.optional(v.boolean()),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { taskId, orgSlug, userId, ...updates } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get the task
    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify it belongs to the organization
    if (task.slug !== orgSlug) {
      throw new Error("Task does not belong to this organization");
    }

    await ctx.db.patch(taskId, {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    });

    return taskId;
  },
});

export const deleteProjectTask = mutation({
  args: {
    taskId: v.id("projectTasks"),
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { taskId, orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get the task
    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify it belongs to the organization
    if (task.slug !== orgSlug) {
      throw new Error("Task does not belong to this organization");
    }

    await ctx.db.delete(taskId);
    return taskId;
  },
});

export const toggleTaskCompletion = mutation({
  args: {
    taskId: v.id("projectTasks"),
    orgSlug: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { taskId, orgSlug, userId } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get the task
    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify it belongs to the organization
    if (task.slug !== orgSlug) {
      throw new Error("Task does not belong to this organization");
    }

    await ctx.db.patch(taskId, {
      isCompleted: !task.isCompleted,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    });

    return taskId;
  },
});
