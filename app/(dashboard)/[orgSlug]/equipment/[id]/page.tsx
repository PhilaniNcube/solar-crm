"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EditEquipmentForm } from "@/components/EditEquipmentForm";
import {
  ArrowLeft,
  Edit,
  DollarSign,
  Calendar,
  Info,
  Settings,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface EquipmentDetailsPageProps {
  params: Promise<{
    orgSlug: string;
    id: string;
  }>;
}

export default function EquipmentDetailsPage({
  params,
}: EquipmentDetailsPageProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{
    orgSlug: string;
    id: string;
  } | null>(null);

  // Resolve params
  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const equipment = useQuery(
    api.equipment.getEquipmentItem,
    resolvedParams
      ? {
          equipmentId: resolvedParams.id as Id<"equipment">,
          orgSlug: resolvedParams.orgSlug,
        }
      : "skip"
  );

  if (!resolvedParams) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (equipment === undefined) {
    return <div className="flex justify-center p-8">Loading equipment...</div>;
  }

  if (equipment === null) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Equipment Not Found
        </h1>
        <p className="text-gray-600">
          The equipment you're looking for doesn't exist or has been deleted.
        </p>
        <Link href={`/${resolvedParams.orgSlug}/equipment`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Equipment
          </Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/${resolvedParams.orgSlug}/equipment`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Equipment
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {equipment.name}
            </h1>
            <p className="text-gray-600">Equipment Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={equipment.isActive ? "default" : "secondary"}>
            {equipment.isActive ? "Active" : "Inactive"}
          </Badge>
          <Button onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Equipment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="text-gray-900 font-medium">{equipment.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {equipment.category}
                    </Badge>
                  </div>
                </div>
                {equipment.manufacturer && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Manufacturer
                    </label>
                    <p className="text-gray-900">{equipment.manufacturer}</p>
                  </div>
                )}
                {equipment.model && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <p className="text-gray-900">{equipment.model}</p>
                  </div>
                )}
              </div>

              {equipment.description && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <p className="text-gray-900 mt-1">
                      {equipment.description}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Specifications */}
          {equipment.specifications &&
            Object.keys(equipment.specifications).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(equipment.specifications).map(
                      ([key, value]) => (
                        <div key={key} className="p-3 bg-gray-50 rounded-lg">
                          <label className="text-sm font-medium text-gray-700">
                            {key}
                          </label>
                          <p className="text-gray-900 font-medium">
                            {String(value)}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price & Warranty */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {equipment.price && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(equipment.price)}
                  </p>
                </div>
              )}
              {equipment.warrantyPeriod && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Warranty Period
                  </label>
                  <p className="text-gray-900 font-medium">
                    {equipment.warrantyPeriod}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Created
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(equipment.createdAt)}
                </p>
              </div>
              {equipment.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(equipment.updatedAt)}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <Badge variant={equipment.isActive ? "default" : "secondary"}>
                    {equipment.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Equipment
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/${resolvedParams.orgSlug}/equipment`}>
                  View All Equipment
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      {equipment && (
        <EditEquipmentForm
          orgSlug={resolvedParams.orgSlug}
          equipment={equipment}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={() => {
            // Equipment will be refetched automatically due to Convex reactivity
          }}
        />
      )}
    </div>
  );
}
