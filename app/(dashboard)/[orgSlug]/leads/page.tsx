import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { LeadsPageClient } from "@/components/LeadsPageClient";
import { Button } from "@/components/ui/button";

interface LeadsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function LeadsPage({ params }: LeadsPageProps) {
  const { userId, orgSlug: currentOrgSlug } = await auth();
  const { orgSlug } = await params;

  if (!userId) {
    redirect("/");
  }

  if (!currentOrgSlug || currentOrgSlug !== orgSlug) {
    notFound();
  }

  // Preload leads data
  const preloadedLeads = await preloadQuery(api.leads.leads, {
    orgSlug,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads Pipeline</h1>
          <p className="text-gray-600">
            Manage your sales pipeline from first contact to quote
          </p>
        </div>
        <Link href={`/${orgSlug}/leads/new`}>
          <Button>Add New Lead</Button>
        </Link>
      </div>

      {/* Leads Page Client Component */}
      <LeadsPageClient preloadedLeads={preloadedLeads} orgSlug={orgSlug} />
    </div>
  );
}
