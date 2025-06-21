"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useQueryState, parseAsString } from "nuqs";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Check, ChevronsUpDown } from "lucide-react";

// Zod schema for lead form validation
const leadSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  source: z.string().optional(),
  status: z.enum(["new", "contacted", "assessment_scheduled", "qualified"], {
    required_error: "Status is required",
  }),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface CreateLeadFormProps {
  orgSlug: string;
  customers: Array<{
    _id: Id<"customers">;
    name: string;
    type: "residential" | "business";
    primaryEmail?: string;
  }>;
  preselectedCustomerId?: Id<"customers">;
}

export function CreateLeadForm({
  orgSlug,
  customers,
  preselectedCustomerId,
}: CreateLeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { organization } = useOrganization();

  // URL state management with nuqs
  const [urlCustomerId, setUrlCustomerId] = useQueryState(
    "customerId",
    parseAsString.withDefault("")
  );

  // Convex mutation hook
  const createLead = useMutation(api.leads.createLead);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    mode: "onChange",
    defaultValues: {
      customerId: urlCustomerId || preselectedCustomerId || "",
      source: "",
      status: "new",
      notes: "",
    },
  });

  const watchedCustomerId = watch("customerId");
  const watchedSource = watch("source");
  const watchedStatus = watch("status");

  const onSubmit = async (data: LeadFormData) => {
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
      const result = await createLead({
        orgSlug: organization?.slug || orgSlug,
        userId: user.id,
        customerId: data.customerId as Id<"customers">,
        source: data.source || undefined,
        status: data.status,
        notes: data.notes || undefined,
      });

      // Redirect to leads list on success
      router.push(`/${organization?.slug || orgSlug}/leads`);
    } catch (err: any) {
      console.error("Error creating lead:", err);
      setError(err.message || "An error occurred while creating the lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCustomer = customers.find((c) => c._id === watchedCustomerId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Lead</CardTitle>
          <CardDescription>
            Add a new lead to your sales pipeline based on an existing customer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}{" "}
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customerId">
                Customer <span className="text-red-500">*</span>
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between",
                      errors.customerId ? "border-red-500" : "",
                      !watchedCustomerId && "text-muted-foreground"
                    )}
                  >
                    {watchedCustomerId
                      ? customers.find(
                          (customer) => customer._id === watchedCustomerId
                        )?.name
                      : "Select a customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search customers..." />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((customer) => (
                          <CommandItem
                            key={customer._id}
                            value={customer.name}
                            onSelect={() => {
                              const newCustomerId =
                                customer._id === watchedCustomerId
                                  ? ""
                                  : customer._id;
                              setValue("customerId", newCustomerId, {
                                shouldValidate: true,
                              });
                              setUrlCustomerId(newCustomerId);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                watchedCustomerId === customer._id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {customer.name}
                              </span>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {customer.type}
                                </Badge>
                                <span>
                                  {customer.primaryEmail || "No email"}
                                </span>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.customerId && (
                <p className="text-red-500 text-sm">
                  {errors.customerId.message}
                </p>
              )}
            </div>
            {/* Selected Customer Info */}
            {selectedCustomer && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-900">Selected Customer</h4>
                <p className="text-blue-700">{selectedCustomer.name}</p>
                <p className="text-sm text-blue-600">
                  {selectedCustomer.type} •{" "}
                  {selectedCustomer.primaryEmail || "No email"}
                </p>
              </div>
            )}
            {/* Lead Source */}
            <div className="space-y-2">
              <Label htmlFor="source">Lead Source</Label>
              <Select
                value={watchedSource}
                onValueChange={(value: string) =>
                  setValue("source", value, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lead source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="advertisement">Advertisement</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="cold_call">Cold Call</SelectItem>
                  <SelectItem value="trade_show">Trade Show</SelectItem>
                  <SelectItem value="email_campaign">Email Campaign</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.source && (
                <p className="text-red-500 text-sm">{errors.source.message}</p>
              )}
            </div>
            {/* Lead Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Lead Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watchedStatus}
                onValueChange={(
                  value:
                    | "new"
                    | "contacted"
                    | "assessment_scheduled"
                    | "qualified"
                ) => setValue("status", value, { shouldValidate: true })}
              >
                <SelectTrigger
                  className={errors.status ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select lead status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="assessment_scheduled">
                    Assessment Scheduled
                  </SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-sm">{errors.status.message}</p>
              )}
            </div>
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Any additional information about this lead..."
                className={errors.notes ? "border-red-500" : ""}
                rows={4}
              />
              {errors.notes && (
                <p className="text-red-500 text-sm">{errors.notes.message}</p>
              )}
            </div>
            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Creating Lead..." : "Create Lead"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(`/${organization?.slug || orgSlug}/leads`)
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
