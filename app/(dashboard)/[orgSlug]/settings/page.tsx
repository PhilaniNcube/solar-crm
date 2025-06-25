import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

interface SettingsPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { orgSlug } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage your organization's configuration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Team Management */}
        <Link
          href={`/${orgSlug}/settings/team`}
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Team Management</h3>
              <p className="text-sm text-gray-600">
                Manage team members and permissions
              </p>
            </div>
          </div>
        </Link>

        {/* Equipment Catalog */}
        <Link
          href={`/${orgSlug}/equipment`}
          className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Equipment Catalog</h3>
              <p className="text-sm text-gray-600">
                Manage solar panels, inverters, and components
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
