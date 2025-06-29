// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Note: Clerk handles users, so we don't need a `users` table for auth.
  // We only need to store the slug on our data.
  customers: defineTable({
    slug: v.string(), // From Clerk Organization
    userId: v.string(), // From Clerk User - for audit purposes
    name: v.string(),
    type: v.union(v.literal("residential"), v.literal("business")),
    primaryEmail: v.optional(v.string()),
    primaryPhone: v.optional(v.string()),
    address: v.optional(v.string()),
    // Google Places API data for solar assessments
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    placeId: v.optional(v.string()),
    createdAt: v.string(), // ISO 8601 timestamp
    updatedAt: v.optional(v.string()), // ISO 8601 timestamp for last update
    updatedBy: v.optional(v.string()), // User ID who last updated
  })
    .index("by_org", ["slug"]) // CRITICAL: Index for fast lookups by organization
    .index("by_user", ["userId"]) // For audit queries
    .index("by_org_user", ["slug", "userId"]), // Compound index for filtering by org and user

  leads: defineTable({
    slug: v.string(),
    userId: v.string(), // From Clerk User - for audit purposes
    customerId: v.id("customers"),
    source: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("assessment_scheduled"),
      v.literal("qualified")
    ),
    notes: v.optional(v.string()),
    createdAt: v.string(), // ISO 8601 timestamp
    updatedAt: v.optional(v.string()), // ISO 8601 timestamp for last update
    updatedBy: v.optional(v.string()), // User ID who last updated
  })
    .index("by_org", ["slug"])
    .index("by_user", ["userId"]) // For audit queries
    .index("by_org_user", ["slug", "userId"]), // Compound index  // Catalog of equipment (panels, inverters, etc.) for each organization

  leadNotes: defineTable({
    slug: v.string(),
    userId: v.string(), // From Clerk User - for audit purposes
    leadId: v.id("leads"),
    content: v.string(),
    createdAt: v.string(), // ISO 8601 timestamp
    updatedAt: v.optional(v.string()), // ISO 8601 timestamp for last update
    updatedBy: v.optional(v.string()), // User ID who last updated
  })
    .index("by_lead", ["slug", "leadId"]) // Compound index for fast lookups by lead
    .index("by_org", ["slug"])
    .index("by_user", ["userId"]), // For audit queries

  equipment: defineTable({
    slug: v.string(),
    userId: v.string(), // From Clerk User - for audit purposes
    name: v.string(),
    category: v.union(
      v.literal("Solar Panel"),
      v.literal("Inverter"),
      v.literal("Battery"),
      v.literal("Mounting System"),
      v.literal("Electrical"),
      v.literal("Tools"),
      v.literal("Other")
    ),
    manufacturer: v.optional(v.string()),
    model: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    specifications: v.optional(v.any()), // Flexible object for category-specific specs
    warrantyPeriod: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    createdAt: v.string(), // ISO 8601 timestamp
    updatedAt: v.optional(v.string()), // ISO 8601 timestamp for last update
    updatedBy: v.optional(v.string()), // User ID who last updated
  })
    .index("by_category", ["category"])
    .index("by_org", ["slug"])
    .index("by_user", ["userId"]), // For audit queries

  quotes: defineTable({
    slug: v.string(),
    userId: v.string(), // From Clerk User - for audit purposes
    customerId: v.id("customers"),
    version: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    systemType: v.union(
      v.literal("grid_tied"),
      v.literal("off_grid"),
      v.literal("hybrid")
    ),
    totalPrice: v.number(),
    // Embed line items directly. This is a common and efficient pattern in document dbs.
    lineItems: v.array(
      v.object({
        equipmentId: v.id("equipment"),
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        equipmentCategory: v.optional(
          v.union(
            v.literal("Solar Panel"),
            v.literal("Inverter"),
            v.literal("Battery"),
            v.literal("Mounting System"),
            v.literal("Electrical"),
            v.literal("Tools"),
            v.literal("Other")
          )
        ),
      })
    ),
    notesForCustomer: v.optional(v.string()),
    createdAt: v.string(), // ISO 8601 timestamp
    updatedAt: v.optional(v.string()), // ISO 8601 timestamp for last update
    updatedBy: v.optional(v.string()), // User ID who last updated
  })
    .index("by_org", ["slug"])
    .index("by_user", ["userId"]), // For audit queries

  projects: defineTable({
    slug: v.string(),
    userId: v.string(), // From Clerk User - for audit purposes
    quoteId: v.id("quotes"),
    customerId: v.id("customers"),
    status: v.union(
      v.literal("planning"),
      v.literal("permitting"),
      v.literal("installing"),
      v.literal("commissioned"),
      v.literal("completed")
    ),
    startDate: v.optional(v.string()), // Using ISO 8601 strings for dates
    completionDate: v.optional(v.string()),
    createdAt: v.string(), // ISO 8601 timestamp
    updatedAt: v.optional(v.string()), // ISO 8601 timestamp for last update
    updatedBy: v.optional(v.string()), // User ID who last updated
  })
    .index("by_org", ["slug"])
    .index("by_user", ["userId"]), // For audit queries
  projectTasks: defineTable({
    slug: v.string(),
    userId: v.string(), // From Clerk User - for audit purposes
    projectId: v.id("projects"),
    title: v.string(),
    isCompleted: v.boolean(),
    dueDate: v.optional(v.string()),
    createdAt: v.string(), // ISO 8601 timestamp
    updatedAt: v.optional(v.string()), // ISO 8601 timestamp for last update
    updatedBy: v.optional(v.string()), // User ID who last updated
  })
    .index("by_project", ["slug", "projectId"]) // Compound index
    .index("by_user", ["userId"]), // For audit queries

  documents: defineTable({
    slug: v.string(),
    userId: v.string(), // From Clerk User - for audit purposes
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"), // Reference to Convex file storage
    uploadedAt: v.string(), // ISO 8601 timestamp
    purpose: v.optional(v.string()), // e.g., "equipment_datasheet", "contract", etc.
    metadata: v.optional(
      v.object({
        originalName: v.optional(v.string()),
        mimeType: v.optional(v.string()),
      })
    ),
  })
    .index("by_org", ["slug"])
    .index("by_user", ["userId"])
    .index("by_purpose", ["slug", "purpose"]),
});
