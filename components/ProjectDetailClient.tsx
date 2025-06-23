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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Project {project._id.toString().slice(0, 8).toUpperCase()}
            </h1>
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

          {/* Project Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Project Created</p>
                  <p className="text-xs text-gray-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {project.startDate && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-xs text-gray-500">
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {project.completionDate && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Target Completion</p>
                    <p className="text-xs text-gray-500">
                      {new Date(project.completionDate).toLocaleDateString()}
                    </p>
                  </div>
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
