"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/utils";

export type Equipment = Doc<"equipment">;

export const createEquipmentColumns = (
  orgSlug: string
): ColumnDef<Equipment>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <Link
            href={`/${orgSlug}/equipment/${row.original._id}`}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            {row.getValue("name")}
          </Link>
          {row.original.model && (
            <span className="text-sm text-muted-foreground">
              Model: {row.original.model}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="capitalize">
          {row.getValue("category")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "manufacturer",
    header: "Manufacturer",
    cell: ({ row }) => {
      const manufacturer = row.getValue("manufacturer") as string;
      return manufacturer || "—";
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return price ? formatCurrency(price) : "—";
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const equipment = row.original;
      const meta = table.options.meta as {
        onView: (equipment: Equipment) => void;
        onEdit: (equipment: Equipment) => void;
        onDelete: (equipment: Equipment) => void;
        onToggleStatus: (equipment: Equipment) => void;
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>{" "}
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(equipment._id)}
            >
              Copy equipment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => meta.onView(equipment)}>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.onEdit(equipment)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit equipment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.onToggleStatus(equipment)}>
              {equipment.isActive ? (
                <ToggleLeft className="mr-2 h-4 w-4" />
              ) : (
                <ToggleRight className="mr-2 h-4 w-4" />
              )}
              {equipment.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => meta.onDelete(equipment)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete equipment
            </DropdownMenuItem>
          </DropdownMenuContent>{" "}
        </DropdownMenu>
      );
    },
  },
];

// For backward compatibility
export const equipmentColumns = (orgSlug: string) =>
  createEquipmentColumns(orgSlug);
