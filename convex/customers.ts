import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all customers for an organization
export const getCustomers = query({
  args: {
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Fetch customers for the given organization slug
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_org", (q) => q.eq("slug", orgSlug))
      .collect();

    return customers;
  },
});

// Query to get a specific customer by ID
export const getCustomer = query({
  args: {
    customerId: v.id("customers"),
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { customerId, orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get the customer
    const customer = await ctx.db.get(customerId);
    if (!customer) {
      return null;
    }

    // Verify it belongs to the organization
    if (customer.slug !== orgSlug) {
      throw new Error("Customer does not belong to this organization");
    }

    return customer;
  },
});

// Query to search customers by name or email
export const searchCustomers = query({
  args: {
    orgSlug: v.string(),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgSlug, searchTerm } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    if (!searchTerm.trim()) {
      return [];
    }

    // Get all customers for the organization and filter by search term
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_org", (q) => q.eq("slug", orgSlug))
      .collect();

    const searchTermLower = searchTerm.toLowerCase();

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTermLower) ||
        (customer.primaryEmail &&
          customer.primaryEmail.toLowerCase().includes(searchTermLower))
    );
  },
});

// Query to get customers by type
export const getCustomersByType = query({
  args: {
    orgSlug: v.string(),
    type: v.union(v.literal("residential"), v.literal("business")),
  },
  handler: async (ctx, args) => {
    const { orgSlug, type } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get customers filtered by organization and type
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_org", (q) => q.eq("slug", orgSlug))
      .filter((q) => q.eq(q.field("type"), type))
      .collect();

    return customers;
  },
});

// Mutation to create a new customer
export const createCustomer = mutation({
  args: {
    orgSlug: v.string(),
    userId: v.string(), // User ID from Clerk (passed from client)
    name: v.string(),
    type: v.union(v.literal("residential"), v.literal("business")),
    primaryEmail: v.optional(v.string()),
    primaryPhone: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { orgSlug, userId, name, type, primaryEmail, primaryPhone, address } =
      args;

    // Validate required fields
    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!name.trim()) {
      throw new Error("Customer name is required");
    }

    // Get current timestamp
    const now = new Date().toISOString();

    // Create the customer
    const customerId = await ctx.db.insert("customers", {
      slug: orgSlug,
      userId,
      name: name.trim(),
      type,
      primaryEmail: primaryEmail?.trim() || undefined,
      primaryPhone: primaryPhone?.trim() || undefined,
      address: address?.trim() || undefined,
      createdAt: now,
    });

    return customerId;
  },
});

// Mutation to update an existing customer
export const updateCustomer = mutation({
  args: {
    customerId: v.id("customers"),
    orgSlug: v.string(),
    userId: v.string(), // User ID from Clerk (passed from client)
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("residential"), v.literal("business"))),
    primaryEmail: v.optional(v.string()),
    primaryPhone: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const {
      customerId,
      orgSlug,
      userId,
      name,
      type,
      primaryEmail,
      primaryPhone,
      address,
    } = args;

    // Validate required fields
    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Verify the customer exists and belongs to the same organization
    const existingCustomer = await ctx.db.get(customerId);
    if (!existingCustomer) {
      throw new Error("Customer not found");
    }

    if (existingCustomer.slug !== orgSlug) {
      throw new Error("Customer does not belong to this organization");
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
        throw new Error("Customer name cannot be empty");
      }
      updateData.name = name.trim();
    }
    if (type !== undefined) updateData.type = type;
    if (primaryEmail !== undefined)
      updateData.primaryEmail = primaryEmail?.trim() || undefined;
    if (primaryPhone !== undefined)
      updateData.primaryPhone = primaryPhone?.trim() || undefined;
    if (address !== undefined)
      updateData.address = address?.trim() || undefined;

    // Update the customer
    await ctx.db.patch(customerId, updateData);

    return customerId;
  },
});

// Mutation to delete a customer
export const deleteCustomer = mutation({
  args: {
    customerId: v.id("customers"),
    orgSlug: v.string(),
    userId: v.string(), // User ID from Clerk (passed from client)
  },
  handler: async (ctx, args) => {
    const { customerId, orgSlug, userId } = args;

    // Validate required fields
    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Verify the customer exists and belongs to the same organization
    const existingCustomer = await ctx.db.get(customerId);
    if (!existingCustomer) {
      throw new Error("Customer not found");
    }

    if (existingCustomer.slug !== orgSlug) {
      throw new Error("Customer does not belong to this organization");
    }

    // Check if customer has any associated leads
    const associatedLeads = await ctx.db
      .query("leads")
      .withIndex("by_org", (q) => q.eq("slug", orgSlug))
      .filter((q) => q.eq(q.field("customerId"), customerId))
      .collect();

    if (associatedLeads.length > 0) {
      throw new Error(
        "Cannot delete customer with associated leads. Please delete or reassign leads first."
      );
    }

    // Check if customer has any associated quotes
    const associatedQuotes = await ctx.db
      .query("quotes")
      .withIndex("by_org", (q) => q.eq("slug", orgSlug))
      .filter((q) => q.eq(q.field("customerId"), customerId))
      .collect();

    if (associatedQuotes.length > 0) {
      throw new Error(
        "Cannot delete customer with associated quotes. Please delete or reassign quotes first."
      );
    }

    // Delete the customer
    await ctx.db.delete(customerId);

    return { success: true };
  },
});

// Query to get customer statistics for an organization
export const getCustomerStats = query({
  args: {
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get all customers for the organization
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_org", (q) => q.eq("slug", orgSlug))
      .collect();

    // Calculate statistics
    const totalCustomers = customers.length;
    const residentialCustomers = customers.filter(
      (c) => c.type === "residential"
    ).length;
    const businessCustomers = customers.filter(
      (c) => c.type === "business"
    ).length;

    // Get customers with leads
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_org", (q) => q.eq("slug", orgSlug))
      .collect();

    const customersWithLeads = new Set(leads.map((lead) => lead.customerId))
      .size;

    return {
      totalCustomers,
      residentialCustomers,
      businessCustomers,
      customersWithLeads,
    };
  },
});

export const getCustomerActivity = query({
  args: {
    orgSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { orgSlug } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // fetch the customers that were either created or updated in the last week
    const oneWeekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const recentCustomers = await ctx.db
      .query("customers")
      .withIndex("by_org", (q) => q.eq("slug", orgSlug))
      .filter((q) =>
        q.or(
          q.gte(q.field("createdAt"), oneWeekAgo),
          q.gte(q.field("updatedAt"), oneWeekAgo)
        )
      )
      .collect();

    return recentCustomers;
  },
});

// Mutation to update customer location with Google Places data
export const updateCustomerLocation = mutation({
  args: {
    customerId: v.id("customers"),
    orgSlug: v.string(),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    placeId: v.string(),
  },
  handler: async (ctx, args) => {
    const { customerId, orgSlug, address, latitude, longitude, placeId } = args;

    if (!orgSlug) {
      throw new Error("Organization slug is required");
    }

    // Get the current customer to verify ownership
    const customer = await ctx.db.get(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    // Verify it belongs to the organization
    if (customer.slug !== orgSlug) {
      throw new Error("Customer does not belong to this organization");
    }

    // Update the customer with location data
    await ctx.db.patch(customerId, {
      address,
      latitude,
      longitude,
      placeId,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});
