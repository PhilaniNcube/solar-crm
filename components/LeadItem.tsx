"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  User,
  Calendar,
  Clock,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Phone,
  Calendar as CalendarIcon,
} from "lucide-react";

interface Lead {
  _id: string;
  slug: string;
  userId: string;
  customerId: string;
  source?: string;
  status: "new" | "contacted" | "assessment_scheduled" | "qualified";
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  customerName?: string;
  customerType?: "residential" | "business";
}

interface LeadItemProps {
  lead: Lead;
  orgSlug: string;
  compact?: boolean;
  name?: string; // Optional name for compact view
  email?: string; // Optional email for compact view
}

export function LeadItem({
  lead,
  orgSlug,
  compact = false,
  name,
  email,
}: LeadItemProps) {
  const getStatusConfig = (status: Lead["status"]) => {
    switch (status) {
      case "new":
        return {
          icon: AlertCircle,
          color: "bg-blue-50 text-blue-700 border-blue-200",
          label: "New Lead",
        };
      case "contacted":
        return {
          icon: Phone,
          color: "bg-orange-50 text-orange-700 border-orange-200",
          label: "Contacted",
        };
      case "assessment_scheduled":
        return {
          icon: CalendarIcon,
          color: "bg-purple-50 text-purple-700 border-purple-200",
          label: "Assessment Scheduled",
        };
      case "qualified":
        return {
          icon: CheckCircle,
          color: "bg-green-50 text-green-700 border-green-200",
          label: "Qualified",
        };
      default:
        return {
          icon: AlertCircle,
          color: "bg-gray-50 text-gray-700 border-gray-200",
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(lead.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (compact) {
    return (
      <Link href={`/${orgSlug}/leads/${lead._id}`} className="block group">
        <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group-hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {name || "Unknown Customer"}
                  {email && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({email})
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(lead.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${statusConfig.color}`}
              >
                {statusConfig.label}
              </Badge>
              <ArrowRight className="h-3 w-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link href={`/${orgSlug}/leads/${lead._id}`} className="block p-4 group">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {lead.customerName || "Unknown Customer"}
                </h3>
                {lead.customerType && (
                  <p className="text-sm text-gray-500 capitalize">
                    {lead.customerType} Customer
                  </p>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className={`${statusConfig.color} flex-shrink-0`}
            >
              {statusConfig.label}
            </Badge>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(lead.createdAt)}</span>
            </div>
            {lead.source && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span className="capitalize">{lead.source}</span>
              </div>
            )}
          </div>

          {/* Notes Preview */}
          {lead.notes && (
            <div className="flex items-start gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-600 line-clamp-2">{lead.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{formatTime(lead.createdAt)}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>
      </Link>
    </Card>
  );
}
