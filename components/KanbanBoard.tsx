"use client";

import { useOptimistic, useTransition } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface Lead {
  _id: Id<"leads">;
  slug: string;
  userId: string;
  customerId: Id<"customers">;
  source?: string;
  status: "new" | "contacted" | "assessment_scheduled" | "qualified";
  notes?: string;
  createdAt: string;
  customerName?: string;
  customerType?: "residential" | "business";
}

interface KanbanBoardProps {
  leads: Lead[];
  orgSlug: string;
}

type LeadStatus = "new" | "contacted" | "assessment_scheduled" | "qualified";

const statusConfig = {
  new: {
    title: "New Leads",
    bgColor: "bg-gray-50",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  contacted: {
    title: "Contacted",
    bgColor: "bg-blue-50",
    badgeColor: "bg-yellow-100 text-yellow-800",
  },
  assessment_scheduled: {
    title: "Assessment",
    bgColor: "bg-yellow-50",
    badgeColor: "bg-orange-100 text-orange-800",
  },
  qualified: {
    title: "Qualified",
    bgColor: "bg-green-50",
    badgeColor: "bg-green-100 text-green-800",
  },
};

export function KanbanBoard({ leads, orgSlug }: KanbanBoardProps) {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const updateLead = useMutation(api.leads.updateLead);

  const router = useRouter();

  // Optimistic updates for lead status changes
  const [optimisticLeads, updateOptimisticLeads] = useOptimistic(
    leads,
    (
      currentLeads,
      { leadId, newStatus }: { leadId: Id<"leads">; newStatus: LeadStatus }
    ) => {
      return currentLeads.map((lead) =>
        lead._id === leadId ? { ...lead, status: newStatus } : lead
      );
    }
  );
  const handleStatusChange = async (
    leadId: Id<"leads">,
    newStatus: LeadStatus
  ) => {
    if (!user?.id) return;

    // Perform the actual update with optimistic update inside transition
    startTransition(async () => {
      // Optimistically update the UI inside the transition
      updateOptimisticLeads({ leadId, newStatus });

      try {
        await updateLead({
          leadId,
          orgSlug,
          userId: user.id,
          status: newStatus,
        });
      } catch (error) {
        console.error("Failed to update lead status:", error);
        // In a real app, you might want to show a toast notification here
        // and potentially revert the optimistic update
      }
    });
  };

  // Group leads by status
  const groupedLeads = optimisticLeads.reduce((acc, lead) => {
    if (!acc[lead.status]) {
      acc[lead.status] = [];
    }
    acc[lead.status].push(lead);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  const getAvailableStatuses = (currentStatus: LeadStatus): LeadStatus[] => {
    const statuses: LeadStatus[] = [
      "new",
      "contacted",
      "assessment_scheduled",
      "qualified",
    ];
    return statuses.filter((status) => status !== currentStatus);
  };

  const formatStatusLabel = (status: LeadStatus): string => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {(
        [
          "new",
          "contacted",
          "assessment_scheduled",
          "qualified",
        ] as LeadStatus[]
      ).map((status) => {
        const config = statusConfig[status];
        const statusLeads = groupedLeads[status] || [];

        return (
          <div
            key={status}
            className={cn(config.bgColor, "rounded-lg shadow py-2")}
          >
            <h3 className="font-semibold text-gray-900 text-lg px-4">
              {config.title} ({statusLeads.length})
            </h3>
            <ScrollArea className={cn("p-4 h-[50vh] rounded", config.bgColor)}>
              <div className="space-y-3">
                {statusLeads.map((lead) => (
                  <Card
                    key={lead._id}
                    className="bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                    onClick={() => router.push(`/${orgSlug}/leads/${lead._id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium">
                            {lead.customerName || `Customer ${lead.customerId}`}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {lead.customerType && (
                              <Badge variant="outline" className="text-xs">
                                {lead.customerType}
                              </Badge>
                            )}
                            {lead.source && (
                              <Badge variant="outline" className="text-xs">
                                {lead.source}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {getAvailableStatuses(lead.status).map(
                              (newStatus) => (
                                <DropdownMenuItem
                                  key={newStatus}
                                  onClick={() =>
                                    handleStatusChange(lead._id, newStatus)
                                  }
                                  disabled={isPending}
                                >
                                  Move to {formatStatusLabel(newStatus)}
                                </DropdownMenuItem>
                              )
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-xs text-gray-400">
                        Created At: {format(lead.createdAt, "Pp")}
                      </p>
                    </CardHeader>{" "}
                  </Card>
                ))}
                {statusLeads.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No leads in this stage</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
