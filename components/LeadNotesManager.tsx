"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { AddLeadNote } from "@/components/AddLeadNote";
import { LeadNotesDisplay } from "@/components/LeadNotesDisplay";

interface LeadNotesManagerProps {
  slug: string;
  leadId: Id<"leads">;
}

export function LeadNotesManager({ slug, leadId }: LeadNotesManagerProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNoteAdded = () => {
    // Force re-render of the notes display by updating the key
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-4">
      <AddLeadNote slug={slug} leadId={leadId} onNoteAdded={handleNoteAdded} />
      <div key={refreshKey}>
        <LeadNotesDisplay slug={slug} leadId={leadId} />
      </div>
    </div>
  );
}
