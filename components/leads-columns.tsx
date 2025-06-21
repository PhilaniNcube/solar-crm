"use client";

import { ColumnDef } from "@tanstack/react-table";
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
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { format } from "date-fns";

interface Lead {
  _id: Id<"leads">;
  slug: string;
  userId: string;
  customerId: Id<"customers">;
  source?: string;
  status: "new" | "contacted" | "assessment_scheduled" | "qualified";
  notes?: string;
  createdAt: string;
  customerName?: string; // Optional for display purposes
}

export function createLeadsColumns(orgSlug: string): ColumnDef<Lead>[] {
  return [
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => {
        const customerName = row.getValue("customerName") as string;
        return <div className="font-medium">{customerName}</div>;
      },
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => {
        const source = row.getValue("source") as string;
        return source ? (
          <Badge variant="outline" className="capitalize">
            {source.replace("_", " ")}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusColors = {
          new: "bg-blue-100 text-blue-800",
          contacted: "bg-yellow-100 text-yellow-800",
          assessment_scheduled: "bg-orange-100 text-orange-800",
          qualified: "bg-green-100 text-green-800",
        };

        return (
          <Badge
            className={`${
              statusColors[status as keyof typeof statusColors]
            } capitalize`}
          >
            {status.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string;
        return notes ? (
          <div className="max-w-[200px] truncate" title={notes}>
            {notes}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return (
          <div className="text-sm">{format(new Date(date), "MMM d, yyyy")}</div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const lead = row.original;

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
                onClick={() => navigator.clipboard.writeText(lead._id)}
              >
                Copy lead ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${orgSlug}/leads/${lead._id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${orgSlug}/leads/${lead._id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit lead
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
