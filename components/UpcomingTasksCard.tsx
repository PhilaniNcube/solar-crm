"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import TaskItem from "./TaskItem";
import Link from "next/link";

interface UpcomingTasksCardProps {
  orgSlug: string;
  userId: string;
  limit?: number;
}

export default function UpcomingTasksCard({
  orgSlug,
  userId,
  limit = 5,
}: UpcomingTasksCardProps) {
  const upcomingTasks = useQuery(api.tasks.getTasksDue, {
    orgSlug,
    daysAhead: 7, // Show tasks due within the next 7 days
  });

  if (upcomingTasks === undefined) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Upcoming Tasks</h2>
        <div className="space-y-3">
          {/* Loading skeleton */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayTasks = upcomingTasks.slice(0, limit);

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Upcoming Tasks</h2>
        {upcomingTasks.length > limit && (
          <Link
            href={`/${orgSlug}/tasks`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all ({upcomingTasks.length})
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {displayTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No upcoming tasks</p>
            <p className="text-sm mt-1">
              Great job! You&apos;re all caught up.
            </p>
          </div>
        ) : (
          displayTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              orgSlug={orgSlug}
              userId={userId}
              showDetails={true}
            />
          ))
        )}
      </div>

      {upcomingTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href={`/${orgSlug}/tasks`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all tasks →
          </Link>
        </div>
      )}
    </div>
  );
}
