"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarDisplay } from "@/components/ui/calendar";
import {
  Calendar,
  User,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { AddTaskDialog } from "./AddTaskDialog";
import { Id } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/utils";

interface ProjectDetailClientProps {
  projectId: string;
  orgSlug: string;
}

const ProjectDetailClient: React.FC<ProjectDetailClientProps> = ({
  projectId,
  orgSlug,
}) => {
  const { user } = useUser();
  const [taskRefreshTrigger, setTaskRefreshTrigger] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const project = useQuery(api.projects.getProject, {
    projectId: projectId as Id<"projects">,
    orgSlug,
  });

  const updateProjectTask = useMutation(api.projects.updateProjectTask);
  const handleTaskToggle = useCallback(
    async (taskId: string, isCompleted: boolean) => {
      if (!user) return;

      try {
        await updateProjectTask({
          taskId: taskId as Id<"projectTasks">,
          orgSlug,
          userId: user.id,
          isCompleted,
        });
      } catch (error) {
        console.error("Error updating task:", error);
      }
    },
    [user, orgSlug, updateProjectTask]
  );

  const handleTaskAdded = useCallback(() => {
    setTaskRefreshTrigger((prev) => prev + 1);
  }, []);

  if (!project) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading project...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      planning: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Planning",
        icon: FileText,
      },
      permitting: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Permitting",
        icon: FileText,
      },
      installing: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        label: "Installing",
        icon: Clock,
      },
      commissioned: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Commissioned",
        icon: CheckCircle,
      },
      completed: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Completed",
        icon: CheckCircle,
      },
    };
    return configs[status as keyof typeof configs] || configs.planning;
  };

  const statusConfig = getStatusConfig(project.status);
  const StatusIcon = statusConfig.icon;

  const completedTasks =
    project.tasks?.filter((task) => task.isCompleted) || [];
  const pendingTasks = project.tasks?.filter((task) => !task.isCompleted) || [];
  const tasksProgress = project.tasks?.length
    ? Math.round((completedTasks.length / project.tasks.length) * 100)
    : 0;

  const overdueTasks = pendingTasks.filter((task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  });

  // Get milestone dates for calendar highlighting
  const getMilestoneDates = () => {
    const milestones: { date: Date; type: string; label: string }[] = [];

    // Project created date
    milestones.push({
      date: new Date(project.createdAt),
      type: "created",
      label: "Project Created",
    });

    // Start date
    if (project.startDate) {
      milestones.push({
        date: new Date(project.startDate),
        type: "start",
        label: "Start Date",
      });
    }

    // Completion date
    if (project.completionDate) {
      milestones.push({
        date: new Date(project.completionDate),
        type: "completion",
        label: "Target Completion",
      });
    }

    // Task due dates
    project.tasks?.forEach((task) => {
      if (task.dueDate) {
        const isOverdue = new Date(task.dueDate) < new Date();
        milestones.push({
          date: new Date(task.dueDate),
          type: task.isCompleted
            ? "task-completed"
            : isOverdue
            ? "task-overdue"
            : "task-pending",
          label: task.title,
        });
      }
    });

    return milestones;
  };

  const milestoneDates = getMilestoneDates();

  // Create date matchers for calendar
  const createdDates = milestoneDates
    .filter((m) => m.type === "created")
    .map((m) => m.date);
  const startDates = milestoneDates
    .filter((m) => m.type === "start")
    .map((m) => m.date);
  const completionDates = milestoneDates
    .filter((m) => m.type === "completion")
    .map((m) => m.date);
  const taskCompletedDates = milestoneDates
    .filter((m) => m.type === "task-completed")
    .map((m) => m.date);
  const taskPendingDates = milestoneDates
    .filter((m) => m.type === "task-pending")
    .map((m) => m.date);
  const taskOverdueDates = milestoneDates
    .filter((m) => m.type === "task-overdue")
    .map((m) => m.date);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-lg font-bold text-gray-900">
              Project ID {project._id.toString().slice(0, 8).toUpperCase()}
            </h2>
            <Badge className={`${statusConfig.bg} ${statusConfig.text}`}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>
          <p className="text-gray-600">
            Solar installation project for {project.customer?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${orgSlug}/projects/${projectId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Project
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">
                      {project.customer?.name} ({project.customer?.type})
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Quote Value</p>
                    <p className="font-medium">
                      {formatCurrency(project.quote?.totalPrice || 0)}
                    </p>
                  </div>
                </div>
                {project.startDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">
                        {new Date(project.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {project.completionDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Target Completion</p>
                      <p className="font-medium">
                        {new Date(project.completionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* System Details */}
              <Separator />
              <div>
                <h4 className="font-medium mb-2">System Details</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">System Type:</span>{" "}
                    {project.quote?.systemType?.replace("_", "-") || "N/A"}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Quote Version:</span> v
                    {project.quote?.version}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Components:</span>{" "}
                    {project.quote?.lineItems?.length || 0} items
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Tasks</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {completedTasks.length} of {project.tasks?.length || 0}{" "}
                    tasks completed ({tasksProgress}%)
                  </p>
                </div>
                <AddTaskDialog
                  projectId={projectId}
                  orgSlug={orgSlug}
                  onTaskAdded={handleTaskAdded}
                />
              </div>
            </CardHeader>
            <CardContent>
              {project.tasks && project.tasks.length > 0 ? (
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${tasksProgress}%` }}
                    ></div>
                  </div>

                  {/* Pending Tasks */}
                  {pendingTasks.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        Pending Tasks ({pendingTasks.length})
                      </h4>
                      <div className="space-y-2">
                        {pendingTasks.map((task) => {
                          const isOverdue =
                            task.dueDate && new Date(task.dueDate) < new Date();
                          return (
                            <div
                              key={task._id}
                              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                                isOverdue
                                  ? "border-red-200 bg-red-50"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <Checkbox
                                checked={task.isCompleted}
                                onCheckedChange={(checked) =>
                                  handleTaskToggle(task._id, !!checked)
                                }
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {task.title}
                                </p>
                                {task.dueDate && (
                                  <p
                                    className={`text-xs ${
                                      isOverdue
                                        ? "text-red-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {isOverdue && (
                                      <AlertCircle className="inline h-3 w-3 mr-1" />
                                    )}
                                    Due:{" "}
                                    {new Date(
                                      task.dueDate
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Completed Tasks */}
                  {completedTasks.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        Completed Tasks ({completedTasks.length})
                      </h4>
                      <div className="space-y-2">
                        {completedTasks.map((task) => (
                          <div
                            key={task._id}
                            className="flex items-center space-x-3 p-3 rounded-lg border border-green-200 bg-green-50"
                          >
                            <Checkbox
                              checked={task.isCompleted}
                              onCheckedChange={(checked) =>
                                handleTaskToggle(task._id, !!checked)
                              }
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm line-through text-gray-600">
                                {task.title}
                              </p>
                              {task.dueDate && (
                                <p className="text-xs text-gray-500">
                                  Due:{" "}
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No tasks yet</p>
                  <AddTaskDialog
                    projectId={projectId}
                    orgSlug={orgSlug}
                    onTaskAdded={handleTaskAdded}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Tasks</span>
                <Badge variant="secondary">{project.tasks?.length || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <Badge variant="outline" className="text-green-600">
                  {completedTasks.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending</span>
                <Badge variant="outline" className="text-blue-600">
                  {pendingTasks.length}
                </Badge>
              </div>
              {overdueTasks.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overdue</span>
                  <Badge variant="outline" className="text-red-600">
                    {overdueTasks.length}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Project Calendar</CardTitle>
              <p className="text-sm text-gray-500">
                Milestones and task due dates
              </p>
            </CardHeader>
            <CardContent>
              <CalendarDisplay
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md w-full"
                modifiers={{
                  created: createdDates,
                  start: startDates,
                  completion: completionDates,
                  taskCompleted: taskCompletedDates,
                  taskPending: taskPendingDates,
                  taskOverdue: taskOverdueDates,
                }}
                modifiersStyles={{
                  created: {
                    backgroundColor: "#dbeafe",
                    color: "#1e40af",
                    fontWeight: "bold",
                  },
                  start: {
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    fontWeight: "bold",
                  },
                  completion: {
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    fontWeight: "bold",
                  },
                  taskCompleted: {
                    backgroundColor: "#d1fae5",
                    color: "#065f46",
                  },
                  taskPending: {
                    backgroundColor: "#e0e7ff",
                    color: "#3730a3",
                  },
                  taskOverdue: {
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                    fontWeight: "bold",
                  },
                }}
              />

              {/* Legend */}
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Legend:</p>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                    <span>Project Created</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                    <span>Start Date</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                    <span>Target Completion</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
                    <span>Task Completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                    <span>Task Due</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                    <span>Task Overdue</span>
                  </div>
                </div>
              </div>

              {/* Selected Date Info */}
              {selectedDate && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {milestoneDates
                    .filter(
                      (milestone) =>
                        milestone.date.toDateString() ===
                        selectedDate.toDateString()
                    )
                    .map((milestone, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        • {milestone.label}
                      </div>
                    ))}
                  {milestoneDates.filter(
                    (milestone) =>
                      milestone.date.toDateString() ===
                      selectedDate.toDateString()
                  ).length === 0 && (
                    <p className="text-sm text-gray-500">
                      No events on this date
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Links */}
          <Card>
            <CardHeader>
              <CardTitle>Related</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href={`/${orgSlug}/customers/${project.customer?._id}`}
                className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm font-medium">View Customer</p>
                <p className="text-xs text-gray-500">
                  {project.customer?.name}
                </p>
              </Link>
              <Link
                href={`/${orgSlug}/quotes/${project.quote?._id}`}
                className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm font-medium">View Quote</p>
                <p className="text-xs text-gray-500">
                  v{project.quote?.version} -{" "}
                  {formatCurrency(project.quote?.totalPrice || 0)}
                </p>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailClient;
