"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Id } from "../convex/_generated/dataModel";
import { formatCurrency } from "../lib/utils";

// Zod schema for project form validation
const projectSchema = z
  .object({
    customerId: z.string().min(1, "Customer is required"),
    quoteId: z.string().min(1, "Quote is required"),
    status: z.enum(
      ["planning", "permitting", "installing", "commissioned", "completed"],
      {
        required_error: "Status is required",
      }
    ),
    startDate: z.string().optional(),
    completionDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.completionDate) {
        return new Date(data.startDate) <= new Date(data.completionDate);
      }
      return true;
    },
    {
      message: "Completion date must be after start date",
      path: ["completionDate"],
    }
  );

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateProjectForm = ({
  onSuccess,
  onCancel,
}: CreateProjectFormProps) => {
  const { user } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const preSelectedQuoteId = searchParams.get("quoteId");

  const createProject = useMutation(api.projects.createProject);
  // Get all customers for the dropdown
  const customers = useQuery(
    api.customers.getCustomers,
    organization?.slug ? { orgSlug: organization.slug } : "skip"
  );

  // Get the pre-selected quote if provided
  const preSelectedQuote = useQuery(
    api.quotes.getQuote,
    organization?.slug && preSelectedQuoteId
      ? {
          orgSlug: organization.slug,
          quoteId: preSelectedQuoteId as Id<"quotes">,
        }
      : "skip"
  );

  // Get accepted quotes for the selected customer
  const availableQuotes =
    useQuery(
      api.quotes.getAcceptedQuotesByCustomer,
      organization?.slug && selectedCustomerId
        ? {
            orgSlug: organization.slug,
            customerId: selectedCustomerId as Id<"customers">,
          }
        : "skip"
    ) || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: "planning",
    },
  });
  const watchedCustomerId = watch("customerId");

  // Handle pre-selected quote
  useEffect(() => {
    if (preSelectedQuote && preSelectedQuote.status === "accepted") {
      setValue("customerId", preSelectedQuote.customerId);
      setValue("quoteId", preSelectedQuote._id);
      setSelectedCustomerId(preSelectedQuote.customerId);
    }
  }, [preSelectedQuote, setValue]);

  // Reset quote selection when customer changes
  useEffect(() => {
    if (watchedCustomerId !== selectedCustomerId && !preSelectedQuoteId) {
      setSelectedCustomerId(watchedCustomerId);
      setValue("quoteId", "");
    }
  }, [watchedCustomerId, selectedCustomerId, setValue, preSelectedQuoteId]);

  const onSubmit = async (data: ProjectFormData) => {
    if (!user || !organization) {
      console.error("User or organization not found");
      return;
    }

    setIsSubmitting(true);

    try {
      const projectId = await createProject({
        orgSlug: organization.slug!,
        userId: user.id,
        customerId: data.customerId as Id<"customers">,
        quoteId: data.quoteId as Id<"quotes">,
        status: data.status,
        startDate: data.startDate || undefined,
        completionDate: data.completionDate || undefined,
      });

      console.log("Project created successfully:", projectId);

      // Reset form
      reset();
      setSelectedCustomerId("");

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/${organization.slug!}/projects`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!organization) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Loading organization...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLoading = customers === undefined;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>
          Create a new project from an accepted quote
        </CardDescription>
      </CardHeader>
      <CardContent>
        {" "}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              {preSelectedQuote && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    Pre-selected Quote
                  </h3>
                  <p className="text-sm text-blue-700">
                    Creating project for Quote v{preSelectedQuote.version} -{" "}
                    {preSelectedQuote.customer?.name} (
                    {formatCurrency(preSelectedQuote.totalPrice)})
                  </p>
                </div>
              )}

              {/* Customer Selection */}
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer *</Label>
                <Select
                  value={watch("customerId") || ""}
                  onValueChange={(value) => setValue("customerId", value)}
                  disabled={!!preSelectedQuote}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem key={customer._id} value={customer._id}>
                        {customer.name} ({customer.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="text-sm text-red-600">
                    {errors.customerId.message}
                  </p>
                )}
                {customers?.length === 0 && (
                  <p className="text-sm text-amber-600">
                    No customers found. Please create a customer first.
                  </p>
                )}
              </div>

              {/* Quote Selection */}
              <div className="space-y-2">
                <Label htmlFor="quoteId">Quote *</Label>
                <Select
                  value={watch("quoteId") || ""}
                  onValueChange={(value) => setValue("quoteId", value)}
                  disabled={!selectedCustomerId || !!preSelectedQuote}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedCustomerId
                          ? "Select a customer first"
                          : availableQuotes.length === 0
                          ? "No accepted quotes available"
                          : "Select a quote"
                      }
                    />
                  </SelectTrigger>{" "}
                  <SelectContent>
                    {preSelectedQuote ? (
                      <SelectItem
                        key={preSelectedQuote._id}
                        value={preSelectedQuote._id}
                      >
                        Quote v{preSelectedQuote.version} -{" "}
                        {formatCurrency(preSelectedQuote.totalPrice)} (
                        {preSelectedQuote.systemType})
                      </SelectItem>
                    ) : (
                      availableQuotes.map((quote) => (
                        <SelectItem key={quote._id} value={quote._id}>
                          Quote v{quote.version} -{" "}
                          {formatCurrency(quote.totalPrice)} ({quote.systemType}
                          )
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.quoteId && (
                  <p className="text-sm text-red-600">
                    {errors.quoteId.message}
                  </p>
                )}{" "}
                {selectedCustomerId &&
                  availableQuotes.length === 0 &&
                  !preSelectedQuote && (
                    <p className="text-sm text-amber-600">
                      No accepted quotes found for this customer. Please ensure
                      there is an accepted quote before creating a project.
                    </p>
                  )}
              </div>

              {/* Status Selection */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={watch("status") || "planning"}
                  onValueChange={(value) => setValue("status", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="permitting">Permitting</SelectItem>
                    <SelectItem value="installing">Installing</SelectItem>
                    <SelectItem value="commissioned">Commissioned</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className="w-full"
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              {/* Completion Date */}
              <div className="space-y-2">
                <Label htmlFor="completionDate">
                  Estimated Completion Date
                </Label>
                <Input
                  id="completionDate"
                  type="date"
                  {...register("completionDate")}
                  className="w-full"
                />
                {errors.completionDate && (
                  <p className="text-sm text-red-600">
                    {errors.completionDate.message}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                {" "}
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !selectedCustomerId ||
                    (!preSelectedQuote && availableQuotes.length === 0) ||
                    customers?.length === 0
                  }
                  className="flex-1"
                >
                  {isSubmitting ? "Creating..." : "Create Project"}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
