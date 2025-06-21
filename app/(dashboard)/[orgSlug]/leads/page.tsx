import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { LeadsClient } from "@/components/LeadsClient";
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

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* New Leads */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">New Leads (5)</h3>
          <div className="space-y-3">
            <div className="bg-white p-3 rounded shadow">
              <h4 className="font-medium">John Smith</h4>
              <p className="text-sm text-gray-600">Residential • 2 days ago</p>
              <p className="text-xs text-gray-500">Interested in 10kW system</p>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <h4 className="font-medium">Sarah Wilson</h4>
              <p className="text-sm text-gray-600">Business • 1 day ago</p>
              <p className="text-xs text-gray-500">Commercial property</p>
            </div>
          </div>
        </div>

        {/* Contacted */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Contacted (3)</h3>
          <div className="space-y-3">
            <div className="bg-white p-3 rounded shadow">
              <h4 className="font-medium">Mike Johnson</h4>
              <p className="text-sm text-gray-600">
                Residential • Called yesterday
              </p>
              <p className="text-xs text-gray-500">Scheduled for site visit</p>
            </div>
          </div>
        </div>

        {/* Site Assessment */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Assessment (2)</h3>
          <div className="space-y-3">
            <div className="bg-white p-3 rounded shadow">
              <h4 className="font-medium">Davis Family</h4>
              <p className="text-sm text-gray-600">Site visit completed</p>
              <p className="text-xs text-gray-500">Ready for quoting</p>
            </div>
          </div>
        </div>

        {/* Quoting */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Quoting (4)</h3>
          <div className="space-y-3">
            <div className="bg-white p-3 rounded shadow">
              <h4 className="font-medium">Peterson Residence</h4>
              <p className="text-sm text-gray-600">Quote in progress</p>
              <p className="text-xs text-gray-500">15kW system design</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <LeadsClient preloadedLeads={preloadedLeads} orgSlug={orgSlug} />
    </div>
  );
}
