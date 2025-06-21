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
import { Id } from "@/convex/_generated/dataModel";

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

interface Customer {
  _id: Id<"customers">;
  name: string;
  type: "residential" | "business";
  primaryEmail?: string;
  primaryPhone?: string;
  address?: string;
  createdAt: string;
}

interface EditCustomerFormProps {
  customer: Customer;
  orgSlug: string;
}

export function EditCustomerForm({ customer, orgSlug }: EditCustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { user } = useUser();
  const { organization } = useOrganization();

  // Convex mutation hook
  const updateCustomer = useMutation(api.customers.updateCustomer);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    mode: "onChange",
    defaultValues: {
      name: customer.name || "",
      type: customer.type || "residential",
      primaryEmail: customer.primaryEmail || "",
      primaryPhone: customer.primaryPhone || "",
      address: customer.address || "",
    },
  });

  const watchedType = watch("type");

  const onSubmit = async (data: CustomerFormData) => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    if (!organization?.slug && !orgSlug) {
      setError("Organization not found");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await updateCustomer({
        customerId: customer._id,
        orgSlug: organization?.slug || orgSlug,
        userId: user.id,
        name: data.name,
        type: data.type,
        primaryEmail: data.primaryEmail || undefined,
        primaryPhone: data.primaryPhone || undefined,
        address: data.address || undefined,
      });

      // Redirect to customer detail page on success
      router.push(
        `/${organization?.slug || orgSlug}/customers/${customer._id}`
      );
    } catch (err: any) {
      console.error("Error updating customer:", err);
      setError(err.message || "An error occurred while updating the customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Customer</CardTitle>
          <CardDescription>
            Update the customer information below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Customer Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter customer name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Customer Type */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Customer Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watchedType}
                onValueChange={(value: "residential" | "business") =>
                  setValue("type", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-red-500 text-sm">{errors.type.message}</p>
              )}
            </div>

            {/* Primary Email */}
            <div className="space-y-2">
              <Label htmlFor="primaryEmail">Primary Email</Label>
              <Input
                id="primaryEmail"
                type="email"
                {...register("primaryEmail")}
                placeholder="customer@example.com"
                className={errors.primaryEmail ? "border-red-500" : ""}
              />
              {errors.primaryEmail && (
                <p className="text-red-500 text-sm">
                  {errors.primaryEmail.message}
                </p>
              )}
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
                <p className="text-red-500 text-sm">
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
                className={errors.address ? "border-red-500" : ""}
                rows={3}
              />
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address.message}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Updating Customer..." : "Update Customer"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(
                    `/${organization?.slug || orgSlug}/customers/${
                      customer._id
                    }`
                  )
                }
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
