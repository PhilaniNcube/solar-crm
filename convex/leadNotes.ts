// convex/leadNotes.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all notes for a specific lead
export const getLeadNotes = query({
  args: {
    slug: v.string(),
    leadId: v.id("leads"),
  },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("leadNotes")
      .withIndex("by_lead", (q) =>
        q.eq("slug", args.slug).eq("leadId", args.leadId)
      )
      .order("desc") // Most recent first
      .collect();

    return notes;
  },
});

// Add a new note to a lead
export const addLeadNote = mutation({
  args: {
    slug: v.string(),
    userId: v.string(),
    leadId: v.id("leads"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    const noteId = await ctx.db.insert("leadNotes", {
      slug: args.slug,
      userId: args.userId,
      leadId: args.leadId,
      content: args.content,
      createdAt: now,
      updatedAt: now,
      updatedBy: args.userId,
    });

    return noteId;
  },
});

// Update an existing note
export const updateLeadNote = mutation({
  args: {
    noteId: v.id("leadNotes"),
    content: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    await ctx.db.patch(args.noteId, {
      content: args.content,
      updatedAt: now,
      updatedBy: args.userId,
    });

    return args.noteId;
  },
});

// Delete a note
export const deleteLeadNote = mutation({
  args: {
    noteId: v.id("leadNotes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.noteId);
  },
});
