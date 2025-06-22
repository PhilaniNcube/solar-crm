import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CreateLeadForm } from "@/components/CreateLeadForm";

interface NewLeadPageProps {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ customerId?: string }>;
}

export default async function NewLeadPage({
  params,
  searchParams,
}: NewLeadPageProps) {
  const { orgSlug } = await params;
  const { customerId } = await searchParams;

  // Fetch customers for the dropdown
  const customers = await fetchQuery(api.customers.getCustomers, {
    orgSlug,
  });

  // If customerId is provided, validate it exists
  let preselectedCustomerId: Id<"customers"> | undefined;
  if (customerId) {
    const customer = customers.find((c) => c._id === customerId);
    if (customer) {
      preselectedCustomerId = customerId as Id<"customers">;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Lead</h1>
        <p className="text-gray-600">Add a new lead to your sales pipeline</p>
      </div>

      {/* Create Lead Form */}
      <CreateLeadForm
        orgSlug={orgSlug}
        customers={customers}
        preselectedCustomerId={preselectedCustomerId}
      />
    </div>
  );
}
