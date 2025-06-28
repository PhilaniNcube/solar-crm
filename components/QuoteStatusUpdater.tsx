"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

interface QuoteStatusUpdaterProps {
  quote: Doc<"quotes"> & { customer: Doc<"customers"> };
  orgSlug: string;
}

export function QuoteStatusUpdater({
  quote,
  orgSlug,
}: QuoteStatusUpdaterProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "sent":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "accepted":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const statusOptions: {
    value: Doc<"quotes">["status"];
    label: string;
    description: string;
  }[] = [
    {
      value: "draft",
      label: "Draft",
      description: "Quote is being prepared",
    },
    {
      value: "sent",
      label: "Sent",
      description: "Quote has been sent to customer",
    },
    {
      value: "accepted",
      label: "Accepted",
      description: "Customer has accepted the quote",
    },
    {
      value: "rejected",
      label: "Rejected",
      description: "Customer has declined the quote",
    },
  ];

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-700">Status:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`${getStatusColor(
              quote.status
            )} transition-colors cursor-pointer px-3 py-1 rounded-md text-sm font-medium`}
            disabled={isUpdating}
          >
            <span className="capitalize">
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </span>
            {!isUpdating && <ChevronDown className="ml-2 h-3 w-3" />}
            {isUpdating && (
              <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b border-current"></div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              disabled={isUpdating || option.value === quote.status}
              className={`flex items-start space-x-3 p-3 ${
                option.value === quote.status ? "bg-gray-50" : ""
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full mt-1 ${
                  getStatusColor(option.value).split(" ")[0]
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{option.label}</span>
                  {option.value === quote.status && (
                    <Check className="h-3 w-3 text-green-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {option.description}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
