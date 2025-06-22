import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all equipment for an organization
export const getEquipment = query({
  args: {
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Fetch equipment for the given organization slug
    const equipment = await ctx.db
      .query("equipment")
      .withIndex("by_org", (q) => q.eq("slug", orgSlug))
      .collect();

    return equipment;
  },
});

// Query to get a specific equipment item by ID
export const getEquipmentItem = query({
  args: {
    equipmentId: v.id("equipment"),
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { equipmentId, orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get the equipment item
    const equipment = await ctx.db.get(equipmentId);
    if (!equipment) {
      return null;
    }

    // Verify it belongs to the organization
    if (equipment.slug !== orgSlug) {
      throw new Error("Equipment does not belong to this organization");
    }

    return equipment;
  },
});

// Query to get equipment by category
export const getEquipmentByCategory = query({
  args: {
    orgSlug: v.string(),
    category: v.union(
      v.literal("Solar Panel"),
      v.literal("Inverter"),
      v.literal("Battery"),
      v.literal("Mounting System"),
      v.literal("Electrical"),
      v.literal("Tools"),
      v.literal("Other")
    ),
  },
  handler: async (ctx, args) => {
    const { orgSlug, category } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Fetch equipment for the given organization and category
    const equipment = await ctx.db
      .query("equipment")
      .withIndex("by_org", (q) => q.eq("slug", orgSlug))
      .filter((q) => q.eq(q.field("category"), category))
      .collect();

    return equipment;
  },
});

// Query to get equipment stats for an organization
export const getEquipmentStats = query({
  args: {
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Fetch all equipment for the organization
    const equipment = await ctx.db
      .query("equipment")
      .withIndex("by_org", (q) => q.eq("slug", orgSlug))
      .collect();

    // Calculate stats
    const totalItems = equipment.length;
    const totalValue = equipment.reduce(
      (sum, item) => sum + (item.price || 0),
      0
    );
    const categories = [...new Set(equipment.map((item) => item.category))];
    const activeItems = equipment.filter(
      (item) => item.isActive !== false
    ).length;

    return {
      totalItems,
      totalValue,
      categoriesCount: categories.length,
      activeItems,
      categories,
    };
  },
});

// Mutation to create new equipment
export const createEquipment = mutation({
  args: {
    orgSlug: v.string(),
    userId: v.string(), // User ID from Clerk (passed from client)
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
    specifications: v.optional(v.any()),
    warrantyPeriod: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const {
      orgSlug,
      userId,
      name,
      category,
      manufacturer,
      model,
      description,
      price,
      specifications,
      warrantyPeriod,
      isActive = true,
    } = args;

    // Validate required fields
    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }
    if (!name.trim()) {
      throw new Error("Equipment name is required");
    }

    if (!category) {
      throw new Error("Equipment category is required");
    } // Get current timestamp
    const now = new Date().toISOString();

    // Clean specifications - remove empty values
    const cleanSpecifications =
      specifications && Object.keys(specifications).length > 0
        ? Object.fromEntries(
            Object.entries(specifications).filter(
              ([key, value]) =>
                key.trim() && typeof value === "string" && value.trim()
            )
          )
        : undefined;

    // Create the equipment item
    const equipmentId = await ctx.db.insert("equipment", {
      slug: orgSlug,
      userId,
      name: name.trim(),
      category,
      manufacturer: manufacturer?.trim(),
      model: model?.trim(),
      description: description?.trim(),
      price,
      specifications: cleanSpecifications,
      warrantyPeriod: warrantyPeriod?.trim(),
      isActive,
      createdAt: now,
    });

    return equipmentId;
  },
});

// Mutation to update equipment
export const updateEquipment = mutation({
  args: {
    equipmentId: v.id("equipment"),
    orgSlug: v.string(),
    userId: v.string(), // User ID from Clerk (passed from client)
    name: v.optional(v.string()),
    category: v.optional(
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
    manufacturer: v.optional(v.string()),
    model: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    specifications: v.optional(v.any()),
    warrantyPeriod: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const {
      equipmentId,
      orgSlug,
      userId,
      name,
      category,
      manufacturer,
      model,
      description,
      price,
      specifications,
      warrantyPeriod,
      isActive,
    } = args;

    // Validate required fields
    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Verify the equipment exists and belongs to the same organization
    const existingEquipment = await ctx.db.get(equipmentId);
    if (!existingEquipment) {
      throw new Error("Equipment not found");
    }

    if (existingEquipment.slug !== orgSlug) {
      throw new Error("Equipment does not belong to this organization");
    }

    // Get current timestamp
    const now = new Date().toISOString();

    // Prepare update object with only defined values
    const updateData: any = {
      updatedAt: now,
      updatedBy: userId,
    };

    if (name !== undefined) {
      if (!name.trim()) {
        throw new Error("Equipment name cannot be empty");
      }
      updateData.name = name.trim();
    }
    if (category !== undefined) {
      if (!category) {
        throw new Error("Equipment category cannot be empty");
      }
      updateData.category = category;
    }
    if (manufacturer !== undefined)
      updateData.manufacturer = manufacturer?.trim() || undefined;
    if (model !== undefined) updateData.model = model?.trim() || undefined;
    if (description !== undefined)
      updateData.description = description?.trim() || undefined;
    if (price !== undefined) updateData.price = price;
    if (specifications !== undefined) {
      // Clean specifications - remove empty values
      const cleanSpecifications =
        specifications && Object.keys(specifications).length > 0
          ? Object.fromEntries(
              Object.entries(specifications).filter(
                ([key, value]) =>
                  key.trim() && typeof value === "string" && value.trim()
              )
            )
          : undefined;
      updateData.specifications = cleanSpecifications;
    }
    if (warrantyPeriod !== undefined)
      updateData.warrantyPeriod = warrantyPeriod?.trim() || undefined;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update the equipment
    await ctx.db.patch(equipmentId, updateData);

    return equipmentId;
  },
});

// Mutation to delete equipment
export const deleteEquipment = mutation({
  args: {
    equipmentId: v.id("equipment"),
    orgSlug: v.string(),
    userId: v.string(), // User ID from Clerk (passed from client)
  },
  handler: async (ctx, args) => {
    const { equipmentId, orgSlug, userId } = args;

    // Validate required fields
    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Verify the equipment exists and belongs to the same organization
    const existingEquipment = await ctx.db.get(equipmentId);
    if (!existingEquipment) {
      throw new Error("Equipment not found");
    }

    if (existingEquipment.slug !== orgSlug) {
      throw new Error("Equipment does not belong to this organization");
    }

    // TODO: Check if equipment is used in any quotes or projects
    // You might want to prevent deletion if it's referenced elsewhere

    // Delete the equipment
    await ctx.db.delete(equipmentId);

    return equipmentId;
  },
});

// Mutation to toggle equipment active status
export const toggleEquipmentStatus = mutation({
  args: {
    equipmentId: v.id("equipment"),
    orgSlug: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { equipmentId, orgSlug, userId } = args;

    // Validate required fields
    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Verify the equipment exists and belongs to the same organization
    const existingEquipment = await ctx.db.get(equipmentId);
    if (!existingEquipment) {
      throw new Error("Equipment not found");
    }

    if (existingEquipment.slug !== orgSlug) {
      throw new Error("Equipment does not belong to this organization");
    }

    // Get current timestamp
    const now = new Date().toISOString();

    // Toggle the active status
    await ctx.db.patch(equipmentId, {
      isActive: !existingEquipment.isActive,
      updatedAt: now,
      updatedBy: userId,
    });

    return equipmentId;
  },
});
