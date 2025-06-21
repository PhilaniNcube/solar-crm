"use client";

import { useMemo, useState } from "react";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createColumns } from "@/components/customers-columns";
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

interface Customer {
  _id: string;
  name: string;
  type: "residential" | "business";
  primaryEmail?: string;
  primaryPhone?: string;
  address?: string;
  createdAt: string;
}

interface CustomerStats {
  totalCustomers: number;
  residentialCustomers: number;
  businessCustomers: number;
  customersWithLeads: number;
}

interface CustomersClientProps {
  preloadedCustomers: Preloaded<typeof api.customers.getCustomers>;
  preloadedCustomerStats: Preloaded<typeof api.customers.getCustomerStats>;
  orgSlug: string;
}

export function CustomersClient({
  preloadedCustomers,
  preloadedCustomerStats,
  orgSlug,
}: CustomersClientProps) {
  // URL state management with nuqs
  const [urlState, setUrlState] = useQueryStates({
    search: parseAsString.withDefault(""),
    type: parseAsString.withDefault(""),
    status: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
  });
  // Local state for table filters (to be synced with URL state)
  const [globalFilter, setGlobalFilter] = useState(urlState.search);
  const [typeFilter, setTypeFilter] = useState(urlState.type);
  const [statusFilter, setStatusFilter] = useState(urlState.status);

  // TanStack table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Preloaded data from Convex
  const customers = usePreloadedQuery(preloadedCustomers) as Customer[];
  const customerStats = usePreloadedQuery(preloadedCustomerStats);

  // Create columns for the DataTable
  const columns = useMemo(() => createColumns(orgSlug), [orgSlug]);

  // Filtered customers based on search and filters
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        !globalFilter ||
        customer.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        (customer.primaryEmail &&
          customer.primaryEmail
            .toLowerCase()
            .includes(globalFilter.toLowerCase())) ||
        (customer.primaryPhone &&
          customer.primaryPhone.includes(globalFilter)) ||
        (customer.address &&
          customer.address.toLowerCase().includes(globalFilter.toLowerCase()));

      const matchesType = !typeFilter || customer.type === typeFilter;

      // For now, we'll implement a basic status filter based on whether they have leads
      // This can be expanded based on your business logic
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && customer.primaryEmail) ||
        (statusFilter === "inactive" && !customer.primaryEmail);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [customers, globalFilter, typeFilter, statusFilter]);
  // Sync local filters with URL state
  const handleGlobalFilterChange = (value: string) => {
    setGlobalFilter(value);
    setUrlState({ search: value, page: 1 });
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setUrlState({ type: value, page: 1 });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setUrlState({ status: value, page: 1 });
  };
  // Create TanStack table instance
  const table = useReactTable({
    data: filteredCustomers,
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
    setTypeFilter("");
    setStatusFilter("");
    setUrlState({ search: "", type: "", status: "", page: 1 });
  };

  const isFiltered = globalFilter || typeFilter || statusFilter;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
          <p className="text-2xl font-bold text-blue-600">
            {customerStats.totalCustomers}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Residential</h3>
          <p className="text-2xl font-bold text-green-600">
            {customerStats.residentialCustomers}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Business</h3>
          <p className="text-2xl font-bold text-purple-600">
            {customerStats.businessCustomers}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">With Leads</h3>
          <p className="text-2xl font-bold text-orange-600">
            {customerStats.customersWithLeads}
          </p>
        </div>
      </div>{" "}
      {/* Customers DataTable */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6">
          {/* Inline Filtering Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <Input
                placeholder="Search customers..."
                value={globalFilter}
                onChange={(event) =>
                  handleGlobalFilterChange(event.target.value)
                }
                className="h-8 w-[150px] lg:w-[250px]"
              />

              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
                    {table.getCoreRowModel().rows.length} customers
                  </span>
                </div>
              )}

              {/* Export Button */}
              <Button variant="outline" size="sm" className="h-8">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>{" "}
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
          </div>
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
    </>
  );
}
