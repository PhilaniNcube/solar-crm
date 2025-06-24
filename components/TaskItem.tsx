"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: {
    _id: Id<"projectTasks">;
    title: string;
    isCompleted: boolean;
    dueDate?: string;
    customerName?: string;
    projectStatus?: string;
  };
  orgSlug: string;
  userId: string;
  showDetails?: boolean;
  className?: string;
}

export default function TaskItem({
  task,
  orgSlug,
  userId,
  showDetails = true,
  className,
}: TaskItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateTask = useMutation(api.tasks.updateTask);

  const handleStatusChange = async (completed: boolean) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await updateTask({
        taskId: task._id,
        orgSlug,
        userId,
        isCompleted: completed,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      // You might want to show a toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${format(date, "h:mm a")}`;
    } else if (date < today) {
      return `Overdue - ${format(date, "MMM d, h:mm a")}`;
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;
  const formattedDueDate = formatDueDate(task.dueDate);

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={handleStatusChange}
        disabled={isUpdating}
        className="rounded"
      />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm truncate",
            task.isCompleted && "line-through text-gray-500"
          )}
        >
          {task.title}
        </p>
        {showDetails && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {task.customerName && (
              <span className="truncate">{task.customerName}</span>
            )}
            {formattedDueDate && (
              <span
                className={cn(
                  "truncate",
                  isOverdue && "text-red-600 font-medium"
                )}
              >
                {formattedDueDate}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
