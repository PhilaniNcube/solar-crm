"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  DollarSign,
  Calendar,
  Zap,
  Eye,
  Edit,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "date-fns";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

interface QuoteSummaryCardProps {
  quote: Doc<"quotes">;
  orgSlug: string;
}

export function QuoteSummaryCard({ quote, orgSlug }: QuoteSummaryCardProps) {
  const { user } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const updateQuoteStatus = useMutation(api.quotes.updateQuoteStatus);

  const handleStatusChange = async (newStatus: Doc<"quotes">["status"]) => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      await updateQuoteStatus({
        quoteId: quote._id,
        orgSlug,
        userId: user.id,
        status: newStatus,
      });
    } catch (error) {
      console.error("Failed to update quote status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions: { value: Doc<"quotes">["status"]; label: string }[] = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
  ];
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSystemTypeLabel = (systemType: string) => {
    switch (systemType) {
      case "grid_tied":
        return "Grid-Tied";
      case "off_grid":
        return "Off-Grid";
      case "hybrid":
        return "Hybrid";
      default:
        return systemType;
    }
  };

  const getSystemTypeIcon = (systemType: string) => {
    return <Zap className="h-4 w-4" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-sm text-gray-900">
              Quote v{quote.version}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer">
                <Badge
                  className={`${getStatusColor(
                    quote.status
                  )} flex items-center space-x-1 hover:opacity-80 transition-opacity`}
                  variant="secondary"
                >
                  <span>
                    {quote.status.charAt(0).toUpperCase() +
                      quote.status.slice(1)}
                  </span>
                  {!isUpdating && <ChevronDown className="h-3 w-3" />}
                  {isUpdating && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                  )}
                </Badge>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={isUpdating || option.value === quote.status}
                  className={option.value === quote.status ? "bg-gray-50" : ""}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        getStatusColor(option.value).split(" ")[0]
                      }`}
                    />
                    <span>{option.label}</span>
                    {option.value === quote.status && (
                      <span className="text-xs text-gray-500">(current)</span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">
              {formatCurrency(quote.totalPrice)}
            </span>
          </div>

          {/* System Type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getSystemTypeIcon(quote.systemType)}
              <span className="text-sm text-gray-600">System</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {getSystemTypeLabel(quote.systemType)}
            </span>
          </div>

          {/* Line Items Count */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Items</span>
            <span className="text-sm font-medium text-gray-900">
              {quote.lineItems.length} item
              {quote.lineItems.length !== 1 ? "s" : ""}
            </span>
          </div>

          <Separator />

          {/* Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Created</span>
            </div>
            <span className="text-sm text-gray-900">
              {formatDate(quote.createdAt, "Pp")}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-2">
            <Link href={`/${orgSlug}/quotes/${quote._id}`} className="flex-1">
              <button className="w-full flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors">
                <Eye className="h-3 w-3" />
                <span>View</span>
              </button>
            </Link>
            <Link
              href={`/${orgSlug}/quotes/${quote._id}/edit`}
              className="flex-1"
            >
              <button className="w-full flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors">
                <Edit className="h-3 w-3" />
                <span>Edit</span>
              </button>
            </Link>
          </div>

          {/* Notes Preview */}
          {quote.notesForCustomer && (
            <div className="pt-2">
              <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                <span className="font-medium">Notes: </span>
                {quote.notesForCustomer.length > 50
                  ? `${quote.notesForCustomer.substring(0, 50)}...`
                  : quote.notesForCustomer}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
