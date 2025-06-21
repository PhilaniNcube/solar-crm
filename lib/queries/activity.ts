// write a function to get the recenet activity for an organization (over the last week)

import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export async function getRecentActivity(orgSlug: string) {
  if (!orgSlug) {
    throw new Error("Organization slug is required");
  }

  const customers = await fetchQuery(api.customers.getCustomerActivity, {
    orgSlug,
  });

  if (!customers) {
    throw new Error("No recent activity found for this organization");
  }

  return customers;
}
