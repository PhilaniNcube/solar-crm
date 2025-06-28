import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const quotes = query({
  args: {
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Fetch quotes for the given organization slug
    const quotes = await ctx.db
      .query("quotes")
      .filter((q) => q.eq(q.field("slug"), orgSlug))
      .collect();

    // Return quotes with customer names
    const quotesWithCustomerNames = await Promise.all(
      quotes.map(async (quote) => {
        const customer = await ctx.db.get(quote.customerId);
        return {
          ...quote,
          customerName: customer ? customer.name : "Unknown Customer",
          customerType: customer ? customer.type : undefined,
        };
      })
    );

    // Sort quotes by createdAt date in descending order
    quotesWithCustomerNames.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime(); // Sort by most recent first
    });

    return quotesWithCustomerNames;
  },
});

export const createQuote = mutation({
  args: {
    orgSlug: v.string(),
    userId: v.string(),
    customerId: v.id("customers"),
    systemType: v.union(
      v.literal("grid_tied"),
      v.literal("off_grid"),
      v.literal("hybrid")
    ),
    lineItems: v.array(
      v.object({
        equipmentId: v.id("equipment"),
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
      })
    ),
    notesForCustomer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const {
      orgSlug,
      userId,
      customerId,
      systemType,
      lineItems,
      notesForCustomer,
    } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Validate customer exists and belongs to organization
    const customer = await ctx.db.get(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }
    if (customer.slug !== orgSlug) {
      throw new Error("Customer does not belong to this organization");
    }

    // Validate equipment exists and belongs to organization, and enrich with categories
    const enrichedLineItems = [];
    for (const item of lineItems) {
      const equipment = await ctx.db.get(item.equipmentId);
      if (!equipment) {
        throw new Error(`Equipment with ID ${item.equipmentId} not found`);
      }
      if (equipment.slug !== orgSlug) {
        throw new Error(
          `Equipment with ID ${item.equipmentId} does not belong to this organization`
        );
      }

      // Add equipment category to line item
      enrichedLineItems.push({
        ...item,
        equipmentCategory: equipment.category,
      });
    }

    // Calculate total price
    const totalPrice = enrichedLineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    // Get the latest version number for this customer
    const existingQuotes = await ctx.db
      .query("quotes")
      .filter((q) => q.eq(q.field("slug"), orgSlug))
      .filter((q) => q.eq(q.field("customerId"), customerId))
      .collect();

    const nextVersion = existingQuotes.length + 1;

    const quoteId = await ctx.db.insert("quotes", {
      slug: orgSlug,
      userId,
      customerId,
      version: nextVersion,
      status: "draft",
      systemType,
      totalPrice,
      lineItems: enrichedLineItems,
      notesForCustomer,
      createdAt: new Date().toISOString(),
    });

    return quoteId;
  },
});

export const getQuote = query({
  args: {
    quoteId: v.id("quotes"),
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { quoteId, orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get the quote
    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      return null;
    }

    // Verify it belongs to the organization
    if (quote.slug !== orgSlug) {
      throw new Error("Quote does not belong to this organization");
    }

    // Get the customer
    const customer = await ctx.db.get(quote.customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    // Get equipment details for line items
    const lineItemsWithEquipment = await Promise.all(
      quote.lineItems.map(async (item) => {
        const equipment = await ctx.db.get(item.equipmentId);
        return {
          ...item,
          equipment: equipment || null,
        };
      })
    );

    return {
      ...quote,
      customer,
      lineItems: lineItemsWithEquipment,
    };
  },
});

export const updateQuote = mutation({
  args: {
    quoteId: v.id("quotes"),
    orgSlug: v.string(),
    userId: v.string(),
    systemType: v.optional(
      v.union(
        v.literal("grid_tied"),
        v.literal("off_grid"),
        v.literal("hybrid")
      )
    ),
    lineItems: v.optional(
      v.array(
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
      )
    ),
    notesForCustomer: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("sent"),
        v.literal("accepted"),
        v.literal("rejected")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { quoteId, orgSlug, userId, ...updates } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get the quote
    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }

    // Verify it belongs to the organization
    if (quote.slug !== orgSlug) {
      throw new Error("Quote does not belong to this organization");
    }

    // Validate equipment if lineItems are being updated
    let finalLineItems = quote.lineItems;
    if (updates.lineItems) {
      const enrichedLineItems = [];
      for (const item of updates.lineItems) {
        const equipment = await ctx.db.get(item.equipmentId);
        if (!equipment) {
          throw new Error(`Equipment with ID ${item.equipmentId} not found`);
        }
        if (equipment.slug !== orgSlug) {
          throw new Error(
            `Equipment with ID ${item.equipmentId} does not belong to this organization`
          );
        }

        // Add equipment category to line item
        enrichedLineItems.push({
          equipmentId: item.equipmentId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          equipmentCategory: equipment.category,
        });
      }

      finalLineItems = enrichedLineItems;
    }

    // Calculate new total price if lineItems are updated
    let totalPrice = quote.totalPrice;
    if (updates.lineItems) {
      totalPrice = finalLineItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
    }

    // Prepare the update object without lineItems first
    const updateData: any = {
      totalPrice,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };

    // Add other updates (excluding lineItems)
    if (updates.systemType !== undefined) {
      updateData.systemType = updates.systemType;
    }
    if (updates.notesForCustomer !== undefined) {
      updateData.notesForCustomer = updates.notesForCustomer;
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    // Add lineItems if they were updated
    if (updates.lineItems) {
      updateData.lineItems = finalLineItems;
    }

    await ctx.db.patch(quoteId, updateData);

    return quoteId;
  },
});

export const deleteQuote = mutation({
  args: {
    quoteId: v.id("quotes"),
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { quoteId, orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get the quote
    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }

    // Verify it belongs to the organization
    if (quote.slug !== orgSlug) {
      throw new Error("Quote does not belong to this organization");
    }

    // Check if quote is used in any projects
    const associatedProjects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("quoteId"), quoteId))
      .collect();

    if (associatedProjects.length > 0) {
      throw new Error(
        "Cannot delete quote with associated projects. Please delete or reassign projects first."
      );
    }

    await ctx.db.delete(quoteId);
    return quoteId;
  },
});

// Query to get accepted quotes for a specific customer
export const getAcceptedQuotesByCustomer = query({
  args: {
    orgSlug: v.string(),
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const { orgSlug, customerId } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Fetch accepted quotes for the given customer
    const quotes = await ctx.db
      .query("quotes")
      .filter((q) => q.eq(q.field("slug"), orgSlug))
      .filter((q) => q.eq(q.field("customerId"), customerId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    // sort quotes by createdAt date in descending order
    quotes.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime(); // Sort by most recent first
    });

    return quotes;
  },
});

// get customer quotes
export const getCustomerQuotes = query({
  args: {
    orgSlug: v.string(),
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const { orgSlug, customerId } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Fetch quotes for the given customer
    const quotes = await ctx.db
      .query("quotes")
      .filter((q) => q.eq(q.field("slug"), orgSlug))
      .filter((q) => q.eq(q.field("customerId"), customerId))
      .collect();

    // Sort quotes by createdAt date in descending order
    quotes.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime(); // Sort by most recent first
    });

    return quotes;
  },
});

// Mutation to update quote status only
export const updateQuoteStatus = mutation({
  args: {
    quoteId: v.id("quotes"),
    orgSlug: v.string(),
    userId: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    const { quoteId, orgSlug, userId, status } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Get the quote
    const quote = await ctx.db.get(quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }

    // Verify it belongs to the organization
    if (quote.slug !== orgSlug) {
      throw new Error("Quote does not belong to this organization");
    }

    // Update the quote status
    await ctx.db.patch(quoteId, {
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    });

    return { success: true, status };
  },
});
