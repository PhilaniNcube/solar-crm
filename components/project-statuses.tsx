"use client";
import { api } from "@/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import {
  ClipboardList,
  FileText,
  Wrench,
  CheckCircle,
  Trophy,
  MoreHorizontal,
  Eye,
  Edit,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

interface Project {
  _id: Id<"projects">;
  _creationTime: number;
  slug: string;
  userId: string;
  quoteId: Id<"quotes">;
  customerId: Id<"customers">;
  status:
    | "planning"
    | "permitting"
    | "installing"
    | "commissioned"
    | "completed";
  startDate?: string;
  completionDate?: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  customerName: string;
  customerType?: "residential" | "business";
  quoteVersion?: number;
  quoteTotal?: number;
}

interface ProjectStatusesProps {
  orgSlug: string;
  preLoadedProjects: Preloaded<typeof api.projects.projects>;
  preloadedTasks: Preloaded<typeof api.tasks.getAllTasks>;
}

const ProjectStatuses = ({
  orgSlug,
  preloadedTasks,
  preLoadedProjects,
}: ProjectStatusesProps) => {
  const projects = usePreloadedQuery(preLoadedProjects);
  const tasks = usePreloadedQuery(preloadedTasks);

  // Count projects by status
  const statusCounts = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Define status configurations
  const statusConfigs = [
    {
      status: "planning",
      label: "Planning",
      icon: ClipboardList,
      color: "bg-blue-100 text-blue-800 border-blue-200",
      description: "Projects in planning phase",
    },
    {
      status: "permitting",
      label: "Permitting",
      icon: FileText,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      description: "Awaiting permits and approvals",
    },
    {
      status: "installing",
      label: "Installing",
      icon: Wrench,
      color: "bg-orange-100 text-orange-800 border-orange-200",
      description: "Installation in progress",
    },
    {
      status: "commissioned",
      label: "Commissioned",
      icon: CheckCircle,
      color: "bg-green-100 text-green-800 border-green-200",
      description: "System commissioned and testing",
    },
    {
      status: "completed",
      label: "Completed",
      icon: Trophy,
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      description: "Project successfully completed",
    },
  ];

  // Calculate total active tasks for all projects
  const totalActiveTasks = tasks.filter((task) => !task.isCompleted).length;
  // Table columns definition
  const columns = React.useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => {
          const project = row.original;
          return (
            <div>
              <div className="font-medium text-gray-900">
                {project.customerName}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {project.customerType || "Unknown"}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as Project["status"];
          const config = statusConfigs.find((s) => s.status === status);
          if (!config) return status;

          const Icon = config.icon;
          return (
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-gray-600" />
              <Badge variant="outline" className={config.color}>
                {config.label}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "quoteTotal",
        header: "Quote Value",
        cell: ({ getValue, row }) => {
          const total = getValue() as number | undefined;
          const version = row.original.quoteVersion;
          return (
            <div>
              <div className="font-medium text-gray-900">
                ${total?.toLocaleString() || "N/A"}
              </div>
              {version && (
                <div className="text-sm text-gray-500">v{version}</div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "startDate",
        header: "Timeline",
        cell: ({ row }) => {
          const project = row.original;
          const startDate = project.startDate;
          const completionDate = project.completionDate;

          return (
            <div className="text-sm">
              {startDate && (
                <div className="text-gray-900">
                  Started: {new Date(startDate).toLocaleDateString()}
                </div>
              )}
              {completionDate && (
                <div className="text-green-600">
                  Completed: {new Date(completionDate).toLocaleDateString()}
                </div>
              )}
              {!startDate && !completionDate && (
                <div className="text-gray-500">No dates set</div>
              )}
            </div>
          );
        },
      },
      {
        id: "tasks",
        header: "Tasks",
        cell: ({ row }) => {
          const project = row.original;
          const projectTasks = tasks.filter(
            (task) => task.projectId === project._id
          );
          const completedTasks = projectTasks.filter(
            (task) => task.isCompleted
          );

          return (
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {completedTasks.length}/{projectTasks.length}
              </div>
              <div className="text-gray-500">completed</div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return (
            <div className="text-sm text-gray-900">
              {date.toLocaleDateString()}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const project = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/${orgSlug}/projects/${project._id}`}
                    className="flex items-center"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/${orgSlug}/projects/${project._id}/edit`}
                    className="flex items-center"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Project
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/${orgSlug}/quotes/${project.quoteId}`}
                    className="flex items-center"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Quote
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/${orgSlug}/schedule?projectId=${project._id}`}
                    className="flex items-center"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [orgSlug, statusConfigs, tasks]
  );

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
          <p className="text-gray-600">
            Track project progress across all stages
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {projects.length}
          </div>
          <div className="text-sm text-gray-600">Total Projects</div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {statusConfigs.map((config) => {
          const count = statusCounts[config.status] || 0;
          const Icon = config.icon;

          return (
            <Card
              key={config.status}
              className={`border-2 ${
                config.color.includes("border") ? config.color : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <Badge variant="outline" className={config.color}>
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {count}
                </div>
                <div className="text-sm text-gray-600">
                  {config.description}
                </div>
                {count > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {((count / projects.length) * 100).toFixed(1)}% of total
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Additional metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {totalActiveTasks}
            </div>
            <div className="text-sm text-gray-600">
              Pending across all projects
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {statusCounts.installing || 0}
            </div>
            <div className="text-sm text-gray-600">Currently installing</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {projects.length > 0
                ? `${(
                    ((statusCounts.completed || 0) / projects.length) *
                    100
                  ).toFixed(1)}%`
                : "0%"}
            </div>
            <div className="text-sm text-gray-600">Projects completed</div>
          </CardContent>
        </Card>
      </div>{" "}
      {/* Projects Table - Show when there are multiple projects */}
      {projects.length > 1 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No projects found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {table.getPageCount() > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}{" "}
                  to{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    projects.length
                  )}{" "}
                  of {projects.length} projects
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {projects.length === 0 && (
        <Card className="mt-6">
          <CardContent className="text-center py-8">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Projects Yet
            </h3>
            <p className="text-gray-600">
              Start by creating quotes for your customers, then convert accepted
              quotes to projects.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectStatuses;
