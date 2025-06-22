import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all tasks for a specific project
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

    return tasks.sort((a, b) => {
      // Sort by completion status (incomplete first), then by due date, then by creation date
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  },
});

// Get all tasks for an organization (across all projects)
export const getAllTasks = query({
  args: {
    orgSlug: v.string(),
    includeCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { orgSlug, includeCompleted = true } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    let tasksQuery = ctx.db
      .query("projectTasks")
      .filter((q) => q.eq(q.field("slug"), orgSlug));

    if (!includeCompleted) {
      tasksQuery = tasksQuery.filter((q) =>
        q.eq(q.field("isCompleted"), false)
      );
    }

    const tasks = await tasksQuery.collect();

    // Enrich tasks with project and customer information
    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        const project = await ctx.db.get(task.projectId);
        if (!project) return { ...task, projectName: "Unknown Project" };

        const customer = await ctx.db.get(project.customerId);

        return {
          ...task,
          projectStatus: project.status,
          customerName: customer ? customer.name : "Unknown Customer",
          customerType: customer ? customer.type : undefined,
        };
      })
    );

    return tasksWithDetails.sort((a, b) => {
      // Sort by completion status (incomplete first), then by due date, then by creation date
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  },
});

// Get tasks due within a specific timeframe
export const getTasksDue = query({
  args: {
    orgSlug: v.string(),
    daysAhead: v.optional(v.number()), // Default to 7 days
  },
  handler: async (ctx, args) => {
    const { orgSlug, daysAhead = 7 } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    const tasks = await ctx.db
      .query("projectTasks")
      .filter((q) => q.eq(q.field("slug"), orgSlug))
      .filter((q) => q.eq(q.field("isCompleted"), false))
      .collect();

    const now = new Date();
    const futureDate = new Date(
      now.getTime() + daysAhead * 24 * 60 * 60 * 1000
    );

    const dueTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= futureDate;
    });

    // Enrich with project and customer information
    const tasksWithDetails = await Promise.all(
      dueTasks.map(async (task) => {
        const project = await ctx.db.get(task.projectId);
        if (!project) return { ...task, projectName: "Unknown Project" };

        const customer = await ctx.db.get(project.customerId);

        return {
          ...task,
          projectStatus: project.status,
          customerName: customer ? customer.name : "Unknown Customer",
          customerType: customer ? customer.type : undefined,
        };
      })
    );

    return tasksWithDetails.sort(
      (a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    );
  },
});

// Get overdue tasks
export const getOverdueTasks = query({
  args: {
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    const tasks = await ctx.db
      .query("projectTasks")
      .filter((q) => q.eq(q.field("slug"), orgSlug))
      .filter((q) => q.eq(q.field("isCompleted"), false))
      .collect();

    const now = new Date();
    const overdueTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < now;
    });

    // Enrich with project and customer information
    const tasksWithDetails = await Promise.all(
      overdueTasks.map(async (task) => {
        const project = await ctx.db.get(task.projectId);
        if (!project) return { ...task, projectName: "Unknown Project" };

        const customer = await ctx.db.get(project.customerId);

        return {
          ...task,
          projectStatus: project.status,
          customerName: customer ? customer.name : "Unknown Customer",
          customerType: customer ? customer.type : undefined,
        };
      })
    );

    return tasksWithDetails.sort(
      (a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    );
  },
});

// Get task statistics for an organization
export const getTaskStats = query({
  args: {
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    const tasks = await ctx.db
      .query("projectTasks")
      .filter((q) => q.eq(q.field("slug"), orgSlug))
      .collect();

    const now = new Date();

    const stats = {
      total: tasks.length,
      completed: 0,
      pending: 0,
      overdue: 0,
      dueToday: 0,
      dueThisWeek: 0,
    };

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    tasks.forEach((task) => {
      if (task.isCompleted) {
        stats.completed++;
      } else {
        stats.pending++;

        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const dueDateOnly = new Date(
            dueDate.getFullYear(),
            dueDate.getMonth(),
            dueDate.getDate()
          );

          if (dueDateOnly < today) {
            stats.overdue++;
          } else if (dueDateOnly.getTime() === today.getTime()) {
            stats.dueToday++;
          } else if (dueDate <= weekFromNow) {
            stats.dueThisWeek++;
          }
        }
      }
    });

    return stats;
  },
});

// Get a specific task
export const getTask = query({
  args: {
    taskId: v.id("projectTasks"),
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { taskId, orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    const task = await ctx.db.get(taskId);
    if (!task) {
      return null;
    }

    // Verify it belongs to the organization
    if (task.slug !== orgSlug) {
      throw new Error("Task does not belong to this organization");
    }

    // Get project and customer information
    const project = await ctx.db.get(task.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const customer = await ctx.db.get(project.customerId);

    return {
      ...task,
      project,
      customer,
    };
  },
});

// Create a new task
export const createTask = mutation({
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

    if (!title.trim()) {
      throw new Error("Task title is required");
    }

    // Verify project exists and belongs to organization
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.slug !== orgSlug) {
      throw new Error("Project does not belong to this organization");
    }

    // Validate due date if provided
    if (dueDate) {
      const due = new Date(dueDate);
      if (isNaN(due.getTime())) {
        throw new Error("Invalid due date format");
      }
    }

    const taskId = await ctx.db.insert("projectTasks", {
      slug: orgSlug,
      userId,
      projectId,
      title: title.trim(),
      isCompleted: false,
      dueDate,
      createdAt: new Date().toISOString(),
    });

    return taskId;
  },
});

// Update a task
export const updateTask = mutation({
  args: {
    taskId: v.id("projectTasks"),
    orgSlug: v.string(),
    userId: v.string(),
    title: v.optional(v.string()),
    isCompleted: v.optional(v.boolean()),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { taskId, orgSlug, userId, title, isCompleted, dueDate } = args;

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

    // Validate title if provided
    if (title !== undefined && !title.trim()) {
      throw new Error("Task title cannot be empty");
    }

    // Validate due date if provided
    if (dueDate !== undefined && dueDate !== null) {
      const due = new Date(dueDate);
      if (isNaN(due.getTime())) {
        throw new Error("Invalid due date format");
      }
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };

    if (title !== undefined) updates.title = title.trim();
    if (isCompleted !== undefined) updates.isCompleted = isCompleted;
    if (dueDate !== undefined) updates.dueDate = dueDate;

    await ctx.db.patch(taskId, updates);

    return taskId;
  },
});

// Delete a task
export const deleteTask = mutation({
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

// Toggle task completion status
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

// Bulk update tasks (useful for marking multiple tasks as complete)
export const bulkUpdateTasks = mutation({
  args: {
    taskIds: v.array(v.id("projectTasks")),
    orgSlug: v.string(),
    userId: v.string(),
    updates: v.object({
      isCompleted: v.optional(v.boolean()),
      dueDate: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { taskIds, orgSlug, userId, updates } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    if (taskIds.length === 0) {
      throw new Error("No tasks specified");
    }

    if (taskIds.length > 50) {
      throw new Error("Cannot update more than 50 tasks at once");
    }

    // Validate all tasks exist and belong to the organization
    const tasks = await Promise.all(
      taskIds.map(async (taskId) => {
        const task = await ctx.db.get(taskId);
        if (!task) {
          throw new Error(`Task with ID ${taskId} not found`);
        }
        if (task.slug !== orgSlug) {
          throw new Error(
            `Task with ID ${taskId} does not belong to this organization`
          );
        }
        return task;
      })
    );

    // Validate due date if provided
    if (updates.dueDate !== undefined && updates.dueDate !== null) {
      const due = new Date(updates.dueDate);
      if (isNaN(due.getTime())) {
        throw new Error("Invalid due date format");
      }
    }

    // Update all tasks
    const updatePromises = taskIds.map(async (taskId) => {
      const updateData: any = {
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      };

      await ctx.db.patch(taskId, updateData);
      return taskId;
    });

    const updatedTaskIds = await Promise.all(updatePromises);
    return updatedTaskIds;
  },
});

// Create multiple tasks at once (useful for project templates)
export const createBulkTasks = mutation({
  args: {
    orgSlug: v.string(),
    userId: v.string(),
    projectId: v.id("projects"),
    tasks: v.array(
      v.object({
        title: v.string(),
        dueDate: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { orgSlug, userId, projectId, tasks } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    if (tasks.length === 0) {
      throw new Error("No tasks specified");
    }

    if (tasks.length > 20) {
      throw new Error("Cannot create more than 20 tasks at once");
    }

    // Verify project exists and belongs to organization
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.slug !== orgSlug) {
      throw new Error("Project does not belong to this organization");
    }

    // Validate all tasks
    tasks.forEach((task, index) => {
      if (!task.title.trim()) {
        throw new Error(`Task ${index + 1}: Title is required`);
      }
      if (task.dueDate) {
        const due = new Date(task.dueDate);
        if (isNaN(due.getTime())) {
          throw new Error(`Task ${index + 1}: Invalid due date format`);
        }
      }
    });

    // Create all tasks
    const createPromises = tasks.map(async (task) => {
      const taskId = await ctx.db.insert("projectTasks", {
        slug: orgSlug,
        userId,
        projectId,
        title: task.title.trim(),
        isCompleted: false,
        dueDate: task.dueDate,
        createdAt: new Date().toISOString(),
      });
      return taskId;
    });

    const createdTaskIds = await Promise.all(createPromises);
    return createdTaskIds;
  },
});
