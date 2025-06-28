import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CustomersClient } from "@/components/CustomersClient";
import { User2, UserPlus } from "lucide-react";

interface CustomersPageProps {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{
    search?: string;
    type?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function CustomersPage({
  params,
  searchParams,
}: CustomersPageProps) {
  const { orgSlug } = await params;

  // Fetch customers data from Convex
  const preloadedCustomers = await preloadQuery(api.customers.getCustomers, {
    orgSlug,
  });

  // Fetch customer stats from Convex
  const preloadedCustomerStats = await preloadQuery(
    api.customers.getCustomerStats,
    {
      orgSlug,
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        <Link href={`/${orgSlug}/customers/new`}>
          <Button className="px-4 py-2">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </Link>
      </div>{" "}
      <CustomersClient
        preloadedCustomers={preloadedCustomers}
        preloadedCustomerStats={preloadedCustomerStats}
        orgSlug={orgSlug}
      />
    </div>
  );
}
