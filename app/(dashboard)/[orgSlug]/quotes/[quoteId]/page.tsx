import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface QuoteDetailPageProps {
  params: Promise<{
    orgSlug: string;
    quoteId: string;
  }>;
}

const QuoteDetailPage = async ({ params }: QuoteDetailPageProps) => {
  const { orgSlug, quoteId } = await params;

  const quote = await fetchQuery(api.quotes.getQuote, {
    quoteId: quoteId as Id<"quotes">,
    orgSlug,
  });

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Quote Not Found</h1>
        <p className="text-gray-600">
          The quote you're looking for doesn't exist or has been deleted.
        </p>
        <Button
          onClick={() => redirect(`/${orgSlug}/quotes`)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Quotes
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quote Details</h1>
        <p className="text-muted-foreground">
          Quote #{quote.version} for {quote.customer.name}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Quote Information */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quote Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{quote.customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{quote.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">System Type</p>
              <p className="font-medium capitalize">
                {quote.systemType.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-bold text-xl">
                {formatCurrency(quote.totalPrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Line Items</h2>
          <div className="space-y-4">
            {quote.lineItems.map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.description}</h3>
                    {item.equipment && (
                      <p className="text-sm text-muted-foreground">
                        {item.equipment.name} - {item.equipment.manufacturer}{" "}
                        {item.equipment.model}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium">
                      {item.quantity} × {formatCurrency(item.unitPrice)} =
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {quote.notesForCustomer && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Notes for Customer</h2>
            <p className="whitespace-pre-wrap">{quote.notesForCustomer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteDetailPage;
