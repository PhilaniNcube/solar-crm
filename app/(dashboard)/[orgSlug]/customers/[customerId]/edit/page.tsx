import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { EditCustomerForm } from "@/components/EditCustomerForm";

interface EditCustomerPageProps {
  params: Promise<{ orgSlug: string; customerId: Id<"customers"> }>;
}

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const { userId } = await auth();
  const { orgSlug, customerId } = await params;

  if (!userId) {
    redirect("/");
  }

  // Fetch customer data
  const customer = await fetchQuery(api.customers.getCustomer, {
    customerId,
    orgSlug,
  });

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
        <p className="text-gray-600">Update customer information</p>
      </div>

      {/* Edit Form */}
      <EditCustomerForm customer={customer} orgSlug={orgSlug} />
    </div>
  );
}
