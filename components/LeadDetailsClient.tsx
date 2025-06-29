"use client";

import React from "react";
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
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  User,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { QuoteSummaryCard } from "./QuoteSummaryCard";
import { LeadNotesManager } from "./LeadNotesManager";

interface LeadDetailsClientProps {
  orgSlug: string;
  leadId: string;
  leadData: {
    customer: Doc<"customers">;
  } & Doc<"leads">;
}

export function LeadDetailsClient({
  orgSlug,
  leadId,
  leadData,
}: LeadDetailsClientProps) {
  const { customer, ...lead } = leadData;

  const quotesData = useQuery(api.quotes.getCustomerQuotes, {
    orgSlug,
    customerId: customer._id,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-gray-100 text-gray-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      case "assessment_scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "qualified":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/${orgSlug}/leads`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leads
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {customer.name}
            </h1>
            <p className="text-gray-600">
              {getStatusLabel(customer.type)} Lead • ID: {leadId}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(lead.status)}>
            {getStatusLabel(lead.status)}
          </Badge>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Lead
          </Button>
          <Link href={`/${orgSlug}/quotes/new?leadId=${leadId}`}>
            <Button>Create Quote</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="text-gray-900 font-medium">{customer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <Badge variant="secondary" className="capitalize">
                    {customer.type}
                  </Badge>
                </div>
                {customer.primaryEmail && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{customer.primaryEmail}</p>
                    </div>
                  </div>
                )}
                {customer.primaryPhone && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{customer.primaryPhone}</p>
                    </div>
                  </div>
                )}
                {customer.address && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{customer.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lead Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Lead Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.source && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Source
                    </label>
                    <p className="text-gray-900">{lead.source}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <Badge className={getStatusColor(lead.status)}>
                    {getStatusLabel(lead.status)}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Created
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">
                      {formatDate(lead.createdAt)}
                    </p>
                  </div>
                </div>
                {lead.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Last Updated
                    </label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">
                        {formatDate(lead.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Lead Notes */}
          <LeadNotesManager slug={orgSlug} leadId={lead._id} />

          {/* Notes */}
          {lead.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {lead.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* {customer.primaryPhone && (
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Customer
                </Button>
              )}
              {customer.primaryEmail && (
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Assessment
              </Button> */}
              <Link href={`/${orgSlug}/quotes/new?leadId=${leadId}`}>
                <Button className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Create Quote
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Timeline */}
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
                  {formatDate(lead.createdAt)}
                </p>
              </div>
              {lead.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(lead.updatedAt)}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Current Status
                </label>
                <div className="mt-1">
                  <Badge className={getStatusColor(lead.status)}>
                    {getStatusLabel(lead.status)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Records */}
          <Card>
            <CardHeader>
              <CardTitle>Related Records</CardTitle>
            </CardHeader>
            <CardContent>
              {quotesData && quotesData.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Quotes ({quotesData.length})
                    </h4>
                    <div className="space-y-3">
                      {quotesData.map((quote) => (
                        <QuoteSummaryCard
                          key={quote._id}
                          quote={quote}
                          orgSlug={orgSlug}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Add spacing before the create new quote link */}
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      href={`/${orgSlug}/quotes/new?leadId=${leadId}`}
                      className="text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      Create another quote →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  <p>No quotes or projects yet.</p>
                  <Link
                    href={`/${orgSlug}/quotes/new?leadId=${leadId}`}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Create the first quote →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
