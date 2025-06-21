import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface CustomerDetailPageProps {
  params: Promise<{ orgSlug: string; customerId: Id<"customers"> }>;
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { orgSlug, customerId } = await params;

  // TODO: Fetch customer data using Convex query
  // For now, showing placeholder content
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{customer?.name}</h1>
          <p className="text-gray-600">Customer Details</p>
        </div>{" "}
        <div className="flex gap-2">
          <Link href={`/${orgSlug}/customers`}>
            <Button variant="outline">Back to Customers</Button>
          </Link>
          <Link href={`/${orgSlug}/customers/${customerId}/edit`}>
            <Button>Edit Customer</Button>
          </Link>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Basic customer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg">{customer.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <div className="mt-1">
                <Badge
                  variant={
                    customer.type === "residential" ? "default" : "secondary"
                  }
                >
                  {customer.type === "residential" ? "Residential" : "Business"}
                </Badge>
              </div>
            </div>

            {customer.primaryEmail && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p>{customer.primaryEmail}</p>
              </div>
            )}

            {customer.primaryPhone && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Phone
                </label>
                <p>{customer.primaryPhone}</p>
              </div>
            )}

            {customer.address && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Address
                </label>
                <p>{customer.address}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">
                Created
              </label>
              <p>{new Date(customer.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest leads, quotes, and projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              No recent activity to display
            </p>
            <div className="space-y-2">
              <Link href={`/${orgSlug}/leads/new?customerId=${customerId}`}>
                <Button variant="outline" className="w-full">
                  Create Lead
                </Button>
              </Link>
              <Link href={`/${orgSlug}/quotes/new?customerId=${customerId}`}>
                <Button variant="outline" className="w-full">
                  Create Quote
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <p className="text-green-700 font-medium">
              Customer created successfully!
            </p>
          </div>
          <p className="text-green-600 text-sm mt-1">
            You can now create leads and quotes for this customer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
