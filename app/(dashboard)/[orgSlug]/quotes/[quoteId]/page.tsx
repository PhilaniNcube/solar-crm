import React from "react";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, Mail, MapPin, Phone, User } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Quote Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quote Details</h1>
            <p className="text-gray-600 mt-1">
              Quote #1 for {quote.customer.name}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {quote.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Client & Quote Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <>
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {quote.customer.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {quote.customer.primaryEmail
                      ? quote.customer.primaryEmail
                      : "No email provided"}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {quote.customer.primaryPhone
                      ? quote.customer.primaryPhone
                      : "No phone provided"}
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    {quote.customer.address}
                  </span>
                </div>
              </>
            </CardContent>
          </Card>

          {/* Quote Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                Quote Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Type</span>
                <span className="text-sm font-medium">
                  {quote.systemType === "grid_tied"
                    ? "Grid Tied"
                    : quote.systemType === "hybrid"
                    ? "Hybrid"
                    : "Off Grid"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quote Date</span>
                <span className="text-sm font-medium">
                  {format(quote.createdAt, "Pp")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valid Until</span>
                <span className="text-sm font-medium">22 Jul 2025</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(quote.totalPrice)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Line Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
                Line Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quote.lineItems.map((item, index) => (
                  <div key={item.equipmentId}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-1">
                          {item.description}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1"></p>
                      </div>
                      <div className="flex items-center space-x-4 mt-3 sm:mt-0">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Qty</p>
                          <p className="font-medium">{item.quantity}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Unit Price</p>
                          <p className="font-medium">
                            {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-bold text-green-600">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {index < quote.lineItems.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>

              {/* Total Section */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">Grand Total</span>
                  <span className="text-3xl font-bold text-green-600">
                    {formatCurrency(quote.totalPrice)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailPage;
