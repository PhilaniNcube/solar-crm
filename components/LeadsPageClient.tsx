"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KanbanBoard } from "@/components/KanbanBoard";
import { LeadsClient } from "@/components/LeadsClient";
import { Id } from "@/convex/_generated/dataModel";

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

interface LeadsPageClientProps {
  preloadedLeads: Preloaded<typeof api.leads.leads>;
  orgSlug: string;
}

export function LeadsPageClient({
  preloadedLeads,
  orgSlug,
}: LeadsPageClientProps) {
  const leads = usePreloadedQuery(preloadedLeads) as Lead[];

  return (
    <>
      {/* Kanban Board */}
      <KanbanBoard leads={leads} orgSlug={orgSlug} />

      {/* Leads Table */}
      <LeadsClient preloadedLeads={preloadedLeads} orgSlug={orgSlug} />
    </>
  );
}
