import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

interface LeadDetailsPageProps {
  params: Promise<{ orgSlug: string; leadId: string }>;
}

export default async function LeadDetailsPage({
  params,
}: LeadDetailsPageProps) {
  const { userId, orgSlug: currentOrgSlug } = await auth();
  const { orgSlug, leadId } = await params;

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
          <h1 className="text-3xl font-bold text-gray-900">John Smith</h1>
          <p className="text-gray-600">Residential Lead • ID: {leadId}</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Edit Lead
          </button>
          <Link
            href={`/${orgSlug}/quotes/new?leadId=${leadId}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Quote
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-gray-900">john.smith@example.com</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Phone
                </label>
                <p className="text-gray-900">(555) 123-4567</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">
                  Address
                </label>
                <p className="text-gray-900">
                  123 Main Street, Anytown, ST 12345
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-4">Lead Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Source
                </label>
                <p className="text-gray-900">Website</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  Contacted
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created
                </label>
                <p className="text-gray-900">March 15, 2024</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Contact
                </label>
                <p className="text-gray-900">Yesterday</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-4">
              Notes & Communication
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600">Yesterday, 2:30 PM</p>
                <p className="text-gray-900">
                  Called customer to schedule site assessment. Very interested
                  in solar, mentioned high electricity bills.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-600">2 days ago</p>
                <p className="text-gray-900">
                  Initial contact via website form. Interested in 10-15kW system
                  for their home.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Add a note..."
              />
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Add Note
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-md hover:bg-gray-50">
                📞 Call Customer
              </button>
              <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-md hover:bg-gray-50">
                ✉️ Send Email
              </button>
              <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-md hover:bg-gray-50">
                📅 Schedule Assessment
              </button>
              <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-md hover:bg-gray-50">
                📋 Create Quote
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Status History</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Contacted</span>
                <span className="text-xs text-gray-500">Yesterday</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="text-sm">New</span>
                <span className="text-xs text-gray-500">2 days ago</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4">Related Records</h3>
            <div className="text-sm text-gray-600">
              <p>No quotes or projects yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
