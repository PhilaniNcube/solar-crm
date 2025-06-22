import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const leads = query({
  args: {
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgSlug } = args;

    // get the organization based on the orgSlug
    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Fetch leads for the given organization slug
    const leads = await ctx.db
      .query("leads")
      .filter((q) => q.eq(q.field("slug"), orgSlug))
      .collect(); // return leads with the customer name and type included
    const leadsWithCustomerNames = await Promise.all(
      leads.map(async (lead) => {
        const customer = await ctx.db.get(lead.customerId);
        return {
          ...lead,
          customerName: customer ? customer.name : "Unknown Customer",
          customerType: customer ? customer.type : undefined,
        };
      })
    );

    return leadsWithCustomerNames;
  },
});

export const createLead = mutation({
  args: {
    orgSlug: v.string(),
    userId: v.string(), // User ID from Clerk (passed from client)
    customerId: v.id("customers"),
    source: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("assessment_scheduled"),
        v.literal("qualified")
      )
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { orgSlug, userId, customerId, source, status = "new", notes } = args;

    // Validate required fields
    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Verify the customer exists and belongs to the same organization
    const customer = await ctx.db.get(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    if (customer.slug !== orgSlug) {
      throw new Error("Customer does not belong to this organization");
    }

    // Get current timestamp
    const now = new Date().toISOString();

    // Create the lead
    const leadId = await ctx.db.insert("leads", {
      slug: orgSlug,
      userId,
      customerId,
      source,
      status,
      notes,
      createdAt: now,
    });

    return leadId;
  },
});

export const updateLead = mutation({
  args: {
    leadId: v.id("leads"),
    orgSlug: v.string(),
    userId: v.string(), // User ID from Clerk (passed from client)
    source: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("assessment_scheduled"),
        v.literal("qualified")
      )
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { leadId, orgSlug, userId, source, status, notes } = args;

    // Validate required fields
    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Verify the lead exists and belongs to the same organization
    const existingLead = await ctx.db.get(leadId);
    if (!existingLead) {
      throw new Error("Lead not found");
    }

    if (existingLead.slug !== orgSlug) {
      throw new Error("Lead does not belong to this organization");
    }

    // Get current timestamp
    const now = new Date().toISOString();

    // Prepare update object with only defined values
    const updateData: any = {
      updatedAt: now,
      updatedBy: userId,
    };

    if (source !== undefined) updateData.source = source;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // Update the lead
    await ctx.db.patch(leadId, updateData);

    return leadId;
  },
});

export const getLead = query({
  args: {
    leadId: v.id("leads"),
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { leadId, orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get the lead
    const lead = await ctx.db.get(leadId);
    if (!lead) {
      return null;
    }

    // Verify it belongs to the organization
    if (lead.slug !== orgSlug) {
      throw new Error("Lead does not belong to this organization");
    }

    return lead;
  },
});

// Query to get a lead with customer details
export const getLeadWithCustomer = query({
  args: {
    leadId: v.id("leads"),
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { leadId, orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get the lead
    const lead = await ctx.db.get(leadId);
    if (!lead) {
      return null;
    }

    // Verify it belongs to the organization
    if (lead.slug !== orgSlug) {
      throw new Error("Lead does not belong to this organization");
    }

    // Get the customer
    const customer = await ctx.db.get(lead.customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    return {
      ...lead,
      customer,
    };
  },
});
