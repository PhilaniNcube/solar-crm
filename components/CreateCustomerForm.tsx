"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
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

// Zod schema for customer form validation
const customerSchema = z.object({
  name: z
    .string()
    .min(1, "Customer name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  type: z.enum(["residential", "business"], {
    required_error: "Customer type is required",
  }),
  primaryEmail: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  primaryPhone: z
    .string()
    .regex(
      /^[\+]?[1-9]?[\d\s\-\(\)]{10,}$/,
      "Please enter a valid phone number"
    )
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CreateCustomerFormProps {
  onSuccess?: (customerId: string) => void;
  onCancel?: () => void;
  redirectOnSuccess?: boolean;
}

export function CreateCustomerForm({
  onSuccess,
  onCancel,
  redirectOnSuccess = false,
}: CreateCustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const router = useRouter();
  const { user } = useUser();
  const { organization } = useOrganization();

  const createCustomer = useMutation(api.customers.createCustomer);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      type: undefined,
      primaryEmail: "",
      primaryPhone: "",
      address: "",
    },
  });

  const watchedType = watch("type");

  const onSubmit = async (data: CustomerFormData) => {
    if (!user?.id || !organization?.slug) {
      setSubmitError("User authentication or organization required");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Clean up empty optional fields
      const cleanData = {
        orgSlug: organization.slug,
        userId: user.id,
        name: data.name,
        type: data.type,
        primaryEmail: data.primaryEmail || undefined,
        primaryPhone: data.primaryPhone || undefined,
        address: data.address || undefined,
      };

      const customerId = await createCustomer(cleanData);

      // Reset form on success
      reset();

      if (onSuccess) {
        onSuccess(customerId);
      }

      if (redirectOnSuccess) {
        router.push(`/${organization.slug}/customers/${customerId}`);
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to create customer. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Customer</CardTitle>
        <CardDescription>
          Create a new customer profile for your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter customer name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>{" "}
          <div className="flex gap-x-3 space-y-0 items-start w-full">
            {/* Customer Type */}
            <div className="space-y-2 w-full">
              <Label htmlFor="type">Customer Type *</Label>
              <Select
                value={watchedType}
                onValueChange={(value) =>
                  setValue("type", value as "residential" | "business")
                }
              >
                <SelectTrigger
                  className={`w-full ${errors.type ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
            {/* Primary Email */}
            <div className="space-y-2 w-full">
              <Label htmlFor="primaryEmail">Primary Email</Label>
              <Input
                id="primaryEmail"
                type="email"
                autoComplete="email"
                {...register("primaryEmail")}
                placeholder="customer@example.com"
                className={errors.primaryEmail ? "border-red-500" : ""}
              />
              {errors.primaryEmail && (
                <p className="text-sm text-red-600">
                  {errors.primaryEmail.message}
                </p>
              )}
            </div>
          </div>
          {/* Primary Phone */}
          <div className="space-y-2">
            <Label htmlFor="primaryPhone">Primary Phone</Label>
            <Input
              id="primaryPhone"
              type="tel"
              {...register("primaryPhone")}
              placeholder="(555) 123-4567"
              className={errors.primaryPhone ? "border-red-500" : ""}
            />
            {errors.primaryPhone && (
              <p className="text-sm text-red-600">
                {errors.primaryPhone.message}
              </p>
            )}
          </div>
          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Enter customer address"
              rows={3}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
          {/* Submit Error */}
          {submitError && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-md">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}
          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Customer"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Export the schema for reuse in other components
export { customerSchema };
export type { CustomerFormData };
