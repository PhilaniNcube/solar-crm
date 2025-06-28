"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GooglePlacesCard } from "@/components/GooglePlacesCard";
import { SolarInsightsCard } from "@/components/SolarInsightsCard";
import { GoogleMapsView } from "@/components/GoogleMapsView";
import { LeadItem } from "@/components/LeadItem";

interface RoofSegment {
  pitchDegrees: number;
  azimuthDegrees: number;
  panelsCount: number;
  yearlyEnergyDcKwh: number;
  segmentIndex: number;
}

export default function CustomerDetailPage() {
  const routeParams = useParams<{
    orgSlug: string;
    customerId: Id<"customers">;
  }>();

  // Use Convex hook to load customer data
  const customer = useQuery(
    api.customers.getCustomer,
    routeParams.orgSlug && routeParams.customerId
      ? {
          customerId: routeParams.customerId,
          orgSlug: routeParams.orgSlug,
        }
      : "skip"
  );

  // load customers leads
  const customerLeads = useQuery(
    api.leads.getCustomerLeads,
    routeParams.orgSlug && routeParams.customerId
      ? {
          customerId: routeParams.customerId,
          orgSlug: routeParams.orgSlug,
        }
      : "skip"
  );

  const [roofSegments, setRoofSegments] = useState<RoofSegment[]>([]);
  const [showRoofOverlay, setShowRoofOverlay] = useState(false);

  const handleRoofSegmentsUpdate = (segments: RoofSegment[]) => {
    setRoofSegments(segments);
    setShowRoofOverlay(segments.length > 0);
  };

  // Handle loading and error states
  if (!routeParams.orgSlug || !routeParams.customerId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (customer === undefined) {
    // Still loading
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (customer === null) {
    // Customer not found
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{customer?.name}</h1>
          <p className="text-gray-600">Customer Details</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${routeParams.orgSlug}/customers`}>
            <Button variant="outline">Back to Customers</Button>
          </Link>
          <Link
            href={`/${routeParams.orgSlug}/customers/${routeParams.customerId}/edit`}
          >
            <Button>Edit Customer</Button>
          </Link>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Basic customer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg">{customer.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <div className="mt-1">
                <Badge
                  variant={
                    customer.type === "residential" ? "outline" : "secondary"
                  }
                >
                  {customer.type === "residential" ? "Residential" : "Business"}
                </Badge>
              </div>
            </div>

            {customer.primaryEmail && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p>{customer.primaryEmail}</p>
              </div>
            )}

            {customer.primaryPhone && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Phone
                </label>
                <p>{customer.primaryPhone}</p>
              </div>
            )}

            {customer.address && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Address
                </label>
                <p>{customer.address}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">
                Created
              </label>
              <p>{new Date(customer.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest leads, quotes, and projects
            </CardDescription>
            <div className="flex flex-col md:flex-row gap-2 mt-4">
              <Link
                href={`/${routeParams.orgSlug}/leads/new?customerId=${routeParams.customerId}`}
              >
                <Button variant="outline" className="w-full">
                  Create Lead
                </Button>
              </Link>
              <Link
                href={`/${routeParams.orgSlug}/quotes/new?customerId=${routeParams.customerId}`}
              >
                <Button variant="outline" className="w-full">
                  Create Quote
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {customerLeads && customerLeads.length > 0 ? (
              <div className="space-y-3">
                {customerLeads.map((lead) => (
                  <LeadItem
                    key={lead._id}
                    lead={lead}
                    orgSlug={routeParams.orgSlug}
                    compact={true}
                    name={customer.name}
                    email={customer.primaryEmail}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No recent activity to display
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Google Places Integration for Solar Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GooglePlacesCard
          customerId={routeParams.customerId}
          orgSlug={routeParams.orgSlug}
          currentAddress={customer.address || ""}
          initialCoordinates={
            customer.latitude && customer.longitude
              ? {
                  lat: customer.latitude,
                  lng: customer.longitude,
                }
              : undefined
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Solar Assessment Ready</CardTitle>
            <CardDescription>
              Use location data for Google Solar API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.latitude && customer.longitude ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800 font-medium">
                    ✓ Location data available
                  </span>
                  <Badge
                    variant="outline"
                    className="text-green-700 border-green-300"
                  >
                    Ready for analysis
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Latitude:</span>
                    <p className="font-mono">{customer.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Longitude:</span>
                    <p className="font-mono">{customer.longitude.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">
                  Set location coordinates to enable solar assessment
                </p>
                <p className="text-xs text-gray-400">
                  Use the location search to get precise coordinates
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Google Maps View for Building Location */}
      {customer.latitude && customer.longitude && (
        <div className="grid grid-cols-1 gap-6">
          <GoogleMapsView
            latitude={customer.latitude}
            longitude={customer.longitude}
            address={customer.address}
            buildingName={customer.name}
            roofSegments={roofSegments}
            showRoofOverlay={showRoofOverlay}
          />
        </div>
      )}

      {/* Solar Insights Section */}
      {customer.latitude && customer.longitude && (
        <div className="space-y-6">
          <SolarInsightsCard
            latitude={customer.latitude}
            longitude={customer.longitude}
            address={customer.address}
            onRoofSegmentsUpdate={handleRoofSegmentsUpdate}
          />
        </div>
      )}
    </div>
  );
}
