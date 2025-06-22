"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Edit, Eye, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/utils";

interface Quote {
  _id: Id<"quotes">;
  _creationTime: number;
  slug: string;
  userId: string;
  customerId: Id<"customers">;
  customerName: string;
  customerType?: "residential" | "business";
  version: number;
  status: "draft" | "sent" | "accepted" | "rejected";
  systemType: "grid_tied" | "off_grid" | "hybrid";
  totalPrice: number;
  lineItems: Array<{
    equipmentId: Id<"equipment">;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  notesForCustomer?: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface QuotesClientProps {
  orgSlug: string;
}

const columnHelper = createColumnHelper<Quote>();

const QuotesClient: React.FC<QuotesClientProps> = ({ orgSlug }) => {
  const quotes = useQuery(api.quotes.quotes, { orgSlug });
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("version", {
        header: "Quote ID",
        cell: (info) => {
          const quote = info.row.original;
          return (
            <div>
              <div className="font-medium text-gray-900 uppercase">
                {quote._id.toString().slice(0, 8)}
              </div>
              <div className="text-sm text-gray-500">v{quote.version}</div>
            </div>
          );
        },
      }),
      columnHelper.accessor("customerName", {
        header: "Customer",
        cell: (info) => {
          const quote = info.row.original;
          return (
            <div>
              <div className="font-medium text-gray-900">
                {quote.customerName}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {quote.customerType || "Unknown"}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("systemType", {
        header: "System Type",
        cell: (info) => {
          const systemType = info.getValue();
          const displayType = systemType.replace("_", "-");
          const totalItems = info.row.original.lineItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          return (
            <div>
              <div className="text-sm text-gray-900 capitalize">
                {displayType}
              </div>
              <div className="text-sm text-gray-500">{totalItems} items</div>
            </div>
          );
        },
      }),
      columnHelper.accessor("totalPrice", {
        header: "Total Price",
        cell: (info) => {
          const price = info.getValue();
          return (
            <div>
              <div className="font-medium text-gray-900">
                {formatCurrency(price)}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const statusConfig = {
            draft: { bg: "bg-gray-100", text: "text-gray-800", label: "Draft" },
            sent: {
              bg: "bg-yellow-100",
              text: "text-yellow-800",
              label: "Sent",
            },
            accepted: {
              bg: "bg-green-100",
              text: "text-green-800",
              label: "Accepted",
            },
            rejected: {
              bg: "bg-red-100",
              text: "text-red-800",
              label: "Rejected",
            },
          };
          const config = statusConfig[status] || statusConfig.draft;

          return (
            <Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
              {config.label}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => {
          const date = new Date(info.getValue());
          return (
            <div className="text-sm text-gray-900">
              {date.toLocaleDateString()}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const quote = info.row.original;
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
                    href={`/${orgSlug}/quotes/${quote._id}`}
                    className="flex items-center"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {(quote.status === "draft" || quote.status === "sent") && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${orgSlug}/quotes/${quote._id}/edit`}
                      className="flex items-center"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Quote
                    </Link>
                  </DropdownMenuItem>
                )}
                {quote.status === "accepted" && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${orgSlug}/projects/new?quoteId=${quote._id}`}
                      className="flex items-center"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </Link>
                  </DropdownMenuItem>
                )}
                {quote.status === "draft" && (
                  <DropdownMenuItem className="text-red-600 focus:text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Quote
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [orgSlug]
  );

  const table = useReactTable({
    data: quotes || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (!quotes) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading quotes...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusCounts = () => {
    const counts = quotes.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      all: quotes.length,
      draft: counts.draft || 0,
      sent: counts.sent || 0,
      accepted: counts.accepted || 0,
      rejected: counts.rejected || 0,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600">Manage system proposals and pricing</p>
        </div>
        <Link href={`/${orgSlug}/quotes/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Quote
          </Button>
        </Link>
      </div>

      {/* Status Filters */}
      <div className="flex space-x-4">
        <Button
          variant={globalFilter === "" ? "default" : "outline"}
          onClick={() => setGlobalFilter("")}
        >
          All ({statusCounts.all})
        </Button>
        <Button
          variant={globalFilter === "draft" ? "default" : "outline"}
          onClick={() => setGlobalFilter("draft")}
        >
          Draft ({statusCounts.draft})
        </Button>
        <Button
          variant={globalFilter === "sent" ? "default" : "outline"}
          onClick={() => setGlobalFilter("sent")}
        >
          Sent ({statusCounts.sent})
        </Button>
        <Button
          variant={globalFilter === "accepted" ? "default" : "outline"}
          onClick={() => setGlobalFilter("accepted")}
        >
          Accepted ({statusCounts.accepted})
        </Button>
        <Button
          variant={globalFilter === "rejected" ? "default" : "outline"}
          onClick={() => setGlobalFilter("rejected")}
        >
          Rejected ({statusCounts.rejected})
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search quotes..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-medium">
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
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
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
                    {quotes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-gray-500 mb-4">No quotes found</p>
                        <Link href={`/${orgSlug}/quotes/new`}>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Your First Quote
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No quotes match your search.
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} quotes
          </div>
          <div className="flex items-center space-x-2">
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
    </div>
  );
};

export default QuotesClient;
