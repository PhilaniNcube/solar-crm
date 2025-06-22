import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateCustomerForm } from "@/components/CreateCustomerForm";

interface NewCustomerPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function NewCustomerPage({
  params,
}: NewCustomerPageProps) {
  const { orgSlug } = await params;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
          <p className="text-gray-600">Create a new customer profile</p>
        </div>
        <Link href={`/${orgSlug}/customers`}>
          <Button variant="outline">Back to Customers</Button>
        </Link>
      </div>

      {/* Form */}
      <CreateCustomerForm redirectOnSuccess={true} />
    </div>
  );
}
