"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, getYear, parseISO } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export type Customer = {
  _id: string;
  name: string;
  type: "residential" | "business";
  primaryEmail?: string;
  primaryPhone?: string;
  address?: string;
  createdAt: string;
};

// Utility functions using date-fns for consistent date formatting
const formatDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy");
  } catch {
    return "Invalid Date";
  }
};

const getYearFromDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return getYear(date);
  } catch {
    return new Date().getFullYear();
  }
};

export const createColumns = (orgSlug: string): ColumnDef<Customer>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div>
          <div className="font-medium text-gray-900">{customer.name}</div>
          <div className="text-sm text-gray-500" suppressHydrationWarning>
            Customer since {getYearFromDate(customer.createdAt)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge
          variant={type === "residential" ? "default" : "secondary"}
          className={
            type === "residential"
              ? "bg-blue-100 text-blue-800"
              : "bg-purple-100 text-purple-800"
          }
        >
          {type === "residential" ? "Residential" : "Business"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div>
          <div className="text-sm text-gray-900">
            {customer.primaryEmail || "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {customer.primaryPhone || "N/A"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Location",
    cell: ({ row }) => {
      const address = row.getValue("address") as string;
      return <div className="text-sm text-gray-900">{address || "N/A"}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: () => {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dateString = row.getValue("createdAt") as string;
      return (
        <div className="text-sm text-gray-900" suppressHydrationWarning>
          {formatDate(dateString)}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const customer = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(customer._id)}
            >
              Copy customer ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${orgSlug}/customers/${customer._id}`}>
                View customer
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${orgSlug}/customers/${customer._id}/edit`}>
                Edit customer
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${orgSlug}/leads/new?customerId=${customer._id}`}>
                Create lead
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${orgSlug}/quotes/new?customerId=${customer._id}`}>
                Create quote
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
