"use client";

import { useMemo, useState } from "react";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Filter, Download } from "lucide-react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { Id } from "@/convex/_generated/dataModel";
import { createLeadsColumns } from "./leads-columns";

interface Lead {
  _id: Id<"leads">;
  slug: string;
  userId: string;
  customerId: Id<"customers">;
  source?: string;
  status: "new" | "contacted" | "assessment_scheduled" | "qualified";
  notes?: string;
  createdAt: string;
}

interface LeadsClientProps {
  preloadedLeads: Preloaded<typeof api.leads.leads>;
  orgSlug: string;
}

export function LeadsClient({ preloadedLeads, orgSlug }: LeadsClientProps) {
  // URL state management with nuqs
  const [urlState, setUrlState] = useQueryStates({
    search: parseAsString.withDefault(""),
    source: parseAsString.withDefault(""),
    status: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
  });

  // Local state for table filters (to be synced with URL state)
  const [globalFilter, setGlobalFilter] = useState(urlState.search);
  const [sourceFilter, setSourceFilter] = useState(urlState.source);
  const [statusFilter, setStatusFilter] = useState(urlState.status);

  // TanStack table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({}); // Preloaded data from Convex
  const rawLeads = usePreloadedQuery(preloadedLeads);

  // Memoize the leads array to prevent re-computation
  const leads = useMemo(() => {
    return Array.isArray(rawLeads) ? rawLeads : [];
  }, [rawLeads]);

  // Create columns for the DataTable
  const columns = useMemo(() => createLeadsColumns(orgSlug), [orgSlug]);

  // Filtered leads based on search and filters
  const filteredLeads = useMemo(() => {
    return leads.filter((lead: any) => {
      const matchesSearch =
        !globalFilter ||
        lead.customerId?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        (lead.source &&
          lead.source.toLowerCase().includes(globalFilter.toLowerCase())) ||
        (lead.notes &&
          lead.notes.toLowerCase().includes(globalFilter.toLowerCase()));

      const matchesSource = !sourceFilter || lead.source === sourceFilter;
      const matchesStatus = !statusFilter || lead.status === statusFilter;

      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [leads, globalFilter, sourceFilter, statusFilter]);

  // Sync local filters with URL state
  const handleGlobalFilterChange = (value: string) => {
    setGlobalFilter(value);
    setUrlState({ search: value, page: 1 });
  };

  const handleSourceFilterChange = (value: string) => {
    setSourceFilter(value);
    setUrlState({ source: value, page: 1 });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setUrlState({ status: value, page: 1 });
  };

  // Create TanStack table instance
  const table = useReactTable({
    data: filteredLeads,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Reset all filters
  const resetFilters = () => {
    setGlobalFilter("");
    setSourceFilter("");
    setStatusFilter("");
    setUrlState({ search: "", source: "", status: "", page: 1 });
  };

  const isFiltered = globalFilter || sourceFilter || statusFilter;

  return (
    <>
      {/* Leads DataTable */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6">
          {/* Inline Filtering Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <Input
                placeholder="Search leads..."
                value={globalFilter}
                onChange={(event) =>
                  handleGlobalFilterChange(event.target.value)
                }
                className="h-8 w-[150px] lg:w-[250px]"
              />

              <Select
                value={sourceFilter}
                onValueChange={handleSourceFilterChange}
              >
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="advertisement">Advertisement</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="cold_call">Cold Call</SelectItem>
                  <SelectItem value="trade_show">Trade Show</SelectItem>
                  <SelectItem value="email_campaign">Email Campaign</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="assessment_scheduled">
                    Assessment Scheduled
                  </SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                </SelectContent>
              </Select>

              {isFiltered && (
                <Button
                  variant="ghost"
                  onClick={resetFilters}
                  className="h-8 px-2 lg:px-3"
                >
                  Reset
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Filter Summary */}
              {isFiltered && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>
                    {table.getFilteredRowModel().rows.length} of{" "}
                    {table.getCoreRowModel().rows.length} leads
                  </span>
                </div>
              )}

              {/* Export Button */}
              <Button variant="outline" size="sm" className="h-8">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          {/* Custom Table Rendering */}
          <div className="w-full">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
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
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                      table.setPageSize(Number(value));
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue
                        placeholder={table.getState().pagination.pageSize}
                      />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to first page</span>
                    ⏮️
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Go to previous page</span>
                    ⬅️
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to next page</span>
                    ➡️
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Go to last page</span>
                    ⏭️
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
