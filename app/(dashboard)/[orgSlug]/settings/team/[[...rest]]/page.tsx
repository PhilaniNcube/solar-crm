import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { OrganizationProfile } from "@clerk/nextjs";

interface TeamSettingsPageProps {
  params: Promise<{ orgSlug: string; rest?: string[] }>;
}

export default async function TeamSettingsPage({
  params,
}: TeamSettingsPageProps) {
  const { orgSlug } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-600">
          Manage team members, roles, and permissions
        </p>
      </div>{" "}
      {/* Clerk Organization Profile Component */}
      <div className="bg-white rounded-lg shadow border">
        <OrganizationProfile
          routing="path"
          path={`/${orgSlug}/settings/team`}
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "shadow-none border-0",
            },
          }}
        />
      </div>
    </div>
  );
}
