"use client";

import { format } from "date-fns";
import UpcomingTasksCard from "@/components/UpcomingTasksCard";
import Link from "next/link";

interface DashboardClientProps {
  orgSlug: string;
  userId: string;
  activity: Array<{
    _id: string;
    name: string;
    type: "business" | "residential";
    createdAt: string;
    updatedAt?: string;
  }>;
}

export default function DashboardClient({
  orgSlug,
  userId,
  activity,
}: DashboardClientProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to your Solar CRM command center
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
          {/* <Link
            href={`/${orgSlug}/schedule`}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="text-sm font-medium">Schedule</div>
          </Link> */}
        </div>
      </div>

      {/* Recent Activity & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">
            Recent Customer Activity
          </h2>
          <div className="space-y-3">
            {activity.map((item) => (
              <div key={item._id} className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    item.type === "business" ? "bg-blue-500" : "bg-green-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.updatedAt
                      ? format(item.updatedAt, "Pp")
                      : format(item.createdAt, "Pp")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <UpcomingTasksCard orgSlug={orgSlug} userId={userId} />
      </div>
    </div>
  );
}
