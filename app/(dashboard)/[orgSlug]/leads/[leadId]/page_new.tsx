import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LeadDetailsClient } from "@/components/LeadDetailsClient";

interface LeadDetailsPageProps {
  params: Promise<{ orgSlug: string; leadId: string }>;
}

export default async function LeadDetailsPage({
  params,
}: LeadDetailsPageProps) {
  const { orgSlug, leadId } = await params;

  // Fetch lead data on the server
  const leadData = await fetchQuery(api.leads.getLeadWithCustomer, {
    leadId: leadId as Id<"leads">,
    orgSlug,
  });

  if (!leadData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Lead Not Found</h1>
        <p className="text-gray-600">
          The lead you're looking for doesn't exist or has been deleted.
        </p>
        <Link href={`/${orgSlug}/leads`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <LeadDetailsClient orgSlug={orgSlug} leadId={leadId} leadData={leadData} />
  );
}
