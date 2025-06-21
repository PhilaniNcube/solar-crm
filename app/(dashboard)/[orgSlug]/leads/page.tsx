import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads Pipeline</h1>
          <p className="text-gray-600">
            Manage your sales pipeline from first contact to quote
          </p>
        </div>
        <Link
          href={`/${orgSlug}/leads/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Lead
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

      {/* Recent Leads Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Recent Leads</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">John Smith</div>
                  <div className="text-sm text-gray-500">john@example.com</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Residential
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    New
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Website
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  2 days ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/${orgSlug}/leads/lead-1`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
              {/* Add more sample rows here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
