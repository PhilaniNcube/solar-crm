import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Upload a document to Convex storage
export const uploadDocument = mutation({
  args: {
    orgSlug: v.string(),
    userId: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"),
    purpose: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        originalName: v.optional(v.string()),
        mimeType: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      slug: args.orgSlug,
      userId: args.userId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      storageId: args.storageId,
      uploadedAt: new Date().toISOString(),
      purpose: args.purpose,
      metadata: args.metadata,
    });

    return documentId;
  },
});

// Get a document by ID
export const getDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      return null;
    }

    // Get the file URL from storage
    const fileUrl = await ctx.storage.getUrl(document.storageId);

    return {
      ...document,
      fileUrl,
    };
  },
});

// Get documents for an organization
export const getDocuments = query({
  args: {
    orgSlug: v.string(),
    purpose: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("documents")
      .withIndex("by_org", (q) => q.eq("slug", args.orgSlug));

    if (args.purpose) {
      query = ctx.db
        .query("documents")
        .withIndex("by_purpose", (q) =>
          q.eq("slug", args.orgSlug).eq("purpose", args.purpose)
        );
    }

    const documents = await query.collect();

    // Get file URLs for all documents
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const fileUrl = await ctx.storage.getUrl(doc.storageId);
        return {
          ...doc,
          fileUrl,
        };
      })
    );

    return documentsWithUrls;
  },
});

// Delete a document
export const deleteDocument = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Delete the file from storage
    await ctx.storage.delete(document.storageId);

    // Delete the document record
    await ctx.db.delete(args.documentId);

    return { success: true };
  },
});

// Generate upload URL for file upload
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
