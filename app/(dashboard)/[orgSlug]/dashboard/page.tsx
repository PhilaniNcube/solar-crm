import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

interface DashboardPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { userId, orgSlug: currentOrgSlug } = await auth();
  const { orgSlug } = await params;

  // Redirect if not authenticated
  if (!userId) {
    redirect("/");
  }

  // Check if user has access to this organization
  if (!currentOrgSlug || currentOrgSlug !== orgSlug) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to your Solar CRM command center
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Active Projects</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
          <p className="text-sm text-gray-600">+2 from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">New Leads</h3>
          <p className="text-3xl font-bold text-green-600">24</p>
          <p className="text-sm text-gray-600">This month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Pending Quotes</h3>
          <p className="text-3xl font-bold text-yellow-600">8</p>
          <p className="text-sm text-gray-600">Awaiting response</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">$147K</p>
          <p className="text-sm text-gray-600">This quarter</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href={`/${orgSlug}/leads/new`}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="text-sm font-medium">Add Lead</div>
          </Link>
          <Link
            href={`/${orgSlug}/customers/new`}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🏠</div>
            <div className="text-sm font-medium">New Customer</div>
          </Link>
          <Link
            href={`/${orgSlug}/quotes`}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm font-medium">Create Quote</div>
          </Link>
          <Link
            href={`/${orgSlug}/schedule`}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="text-sm font-medium">Schedule</div>
          </Link>
        </div>
      </div>

      {/* Recent Activity & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">New lead created: John Smith</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Quote sent to Sarah Wilson</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Project completed for Davis family</p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Upcoming Tasks</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input type="checkbox" className="rounded" />
              <div className="flex-1">
                <p className="text-sm">Site assessment - Miller residence</p>
                <p className="text-xs text-gray-500">Tomorrow, 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" className="rounded" />
              <div className="flex-1">
                <p className="text-sm">Follow up with Peterson quote</p>
                <p className="text-xs text-gray-500">Friday, 2:00 PM</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input type="checkbox" className="rounded" />
              <div className="flex-1">
                <p className="text-sm">Equipment delivery - Johnson project</p>
                <p className="text-xs text-gray-500">Next Monday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
