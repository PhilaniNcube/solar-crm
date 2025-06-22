"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  Settings,
  Plus,
  Package,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Equipment, equipmentColumns } from "./equipment-columns";
import { CreateEquipmentForm } from "./CreateEquipmentForm";
import { formatCurrency } from "@/lib/utils";

interface EquipmentClientProps {
  orgSlug: string;
}

export function EquipmentClient({ orgSlug }: EquipmentClientProps) {
  const { userId } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(
    null
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // URL state management
  const [{ search, category, status }, setFilters] = useQueryStates({
    search: parseAsString.withDefault(""),
    category: parseAsString.withDefault(""),
    status: parseAsStringEnum(["active", "inactive", ""]).withDefault(""),
  });

  // Queries
  const equipment = useQuery(api.equipment.getEquipment, { orgSlug });
  const stats = useQuery(api.equipment.getEquipmentStats, { orgSlug });

  // Mutations
  const deleteEquipment = useMutation(api.equipment.deleteEquipment);
  const toggleEquipmentStatus = useMutation(
    api.equipment.toggleEquipmentStatus
  );

  // Filter data based on URL state
  const filteredData = useMemo(() => {
    if (!equipment) return [];

    return equipment.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.manufacturer?.toLowerCase().includes(search.toLowerCase()) ||
        item.model?.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === "" || item.category === category;

      const matchesStatus =
        status === "" ||
        (status === "active" && item.isActive) ||
        (status === "inactive" && !item.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [equipment, search, category, status]);

  // Get unique categories for filtering
  const categories = useMemo(() => {
    if (!equipment) return [];
    return [...new Set(equipment.map((item) => item.category))].sort();
  }, [equipment]);

  const handleDelete = async (equipment: Equipment) => {
    if (!userId) {
      toast.error("You must be logged in to delete equipment");
      return;
    }

    try {
      await deleteEquipment({
        equipmentId: equipment._id,
        orgSlug,
        userId,
      });
      toast.success("Equipment deleted successfully");
      setEquipmentToDelete(null);
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Failed to delete equipment");
    }
  };

  const handleToggleStatus = async (equipment: Equipment) => {
    if (!userId) {
      toast.error("You must be logged in to update equipment");
      return;
    }

    try {
      await toggleEquipmentStatus({
        equipmentId: equipment._id,
        orgSlug,
        userId,
      });
      toast.success(
        `Equipment ${
          equipment.isActive ? "deactivated" : "activated"
        } successfully`
      );
    } catch (error) {
      console.error("Error updating equipment status:", error);
      toast.error("Failed to update equipment status");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns: equipmentColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: {
      onEdit: (equipment: Equipment) => {
        // TODO: Implement edit functionality
        console.log("Edit equipment:", equipment);
      },
      onDelete: setEquipmentToDelete,
      onToggleStatus: handleToggleStatus,
    },
  });

  if (equipment === undefined) {
    return <div className="flex justify-center p-8">Loading equipment...</div>;
  }

  return (
    <div className="space-y-6">
      {" "}
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                {stats.categoriesCount} categories
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Equipment inventory value
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Items
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeItems}</div>
              <p className="text-xs text-muted-foreground">Available for use</p>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Equipment Inventory</CardTitle>
              <CardDescription>
                Manage your solar equipment catalog and inventory
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-2 py-4">
            <Input
              placeholder="Search equipment..."
              value={search}
              onChange={(event) => setFilters({ search: event.target.value })}
              className="max-w-sm"
            />
            <Select
              value={category}
              onValueChange={(value) => setFilters({ category: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) =>
                setFilters({ status: value as "active" | "inactive" | "" })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <Settings className="mr-2 h-4 w-4" />
                  View
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table */}
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
                      colSpan={equipmentColumns.length}
                      className="h-24 text-center"
                    >
                      No equipment found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
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
        </CardContent>
      </Card>
      {/* Create Equipment Form */}
      <CreateEquipmentForm
        orgSlug={orgSlug}
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={() => {
          // Equipment will be refetched automatically due to Convex reactivity
        }}
      />
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!equipmentToDelete}
        onOpenChange={() => setEquipmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              equipment &quot;{equipmentToDelete?.name}&quot; from your
              inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                equipmentToDelete && handleDelete(equipmentToDelete)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
