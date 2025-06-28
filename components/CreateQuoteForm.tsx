"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/utils";

const lineItemSchema = z.object({
  equipmentId: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
});

const quoteSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  systemType: z.enum(["grid_tied", "off_grid", "hybrid"]),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "At least one line item is required"),
  notesForCustomer: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface CreateQuoteFormProps {
  orgSlug: string;
  prefilledLead?: {
    id: Id<"leads">;
    customer: {
      _id: Id<"customers">;
      name: string;
      type: "residential" | "business";
    };
  };
  allLeads?: Array<{
    _id: Id<"leads">;
    customer: {
      _id: Id<"customers">;
      name: string;
      type: "residential" | "business";
    };
  }>;
}

export const CreateQuoteForm: React.FC<CreateQuoteFormProps> = ({
  orgSlug,
  prefilledLead,
  allLeads = [],
}) => {
  const { user } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createQuote = useMutation(api.quotes.createQuote);

  // Fetch equipment for the organization
  const equipment = useQuery(api.equipment.getEquipment, { orgSlug });

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customerId: prefilledLead?.customer._id || "",
      systemType: "grid_tied",
      lineItems: [
        {
          equipmentId: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
      notesForCustomer: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const addLineItem = () => {
    append({
      equipmentId: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
    });
  };

  const removeLineItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleEquipmentChange = (index: number, equipmentId: string) => {
    const selectedEquipment = equipment?.find((eq) => eq._id === equipmentId);
    if (selectedEquipment) {
      form.setValue(`lineItems.${index}.equipmentId`, equipmentId);
      form.setValue(
        `lineItems.${index}.description`,
        `${selectedEquipment.name} ${
          selectedEquipment.manufacturer
            ? `- ${selectedEquipment.manufacturer}`
            : ""
        } ${selectedEquipment.model ? `${selectedEquipment.model}` : ""}`.trim()
      );
      form.setValue(
        `lineItems.${index}.unitPrice`,
        selectedEquipment.price || 0
      );
    }
  };

  const calculateTotal = () => {
    const lineItems = form.getValues("lineItems");
    return lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  const onSubmit = async (data: QuoteFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const quoteId = await createQuote({
        orgSlug,
        userId: user.id,
        customerId: data.customerId as Id<"customers">,
        systemType: data.systemType,
        lineItems: data.lineItems.map((item) => ({
          equipmentId: item.equipmentId as Id<"equipment">,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        notesForCustomer: data.notesForCustomer,
      });

      router.push(`/${orgSlug}/quotes/${quoteId}`);
    } catch (error) {
      console.error("Error creating quote:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!equipment) {
    return <div>Loading equipment...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Quote</h1>
        <p className="text-muted-foreground">
          {prefilledLead
            ? `Creating quote for ${prefilledLead.customer.name}`
            : "Create a new solar system quote"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
              <CardDescription>
                Basic information about the quote
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!prefilledLead && (
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allLeads.map((lead) => (
                            <SelectItem
                              key={lead._id}
                              value={lead.customer._id}
                            >
                              {lead.customer.name}
                              <Badge variant="outline" className="ml-2">
                                {lead.customer.type}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {prefilledLead && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Customer:</span>
                    <span>{prefilledLead.customer.name}</span>
                    <Badge variant="outline">
                      {prefilledLead.customer.type}
                    </Badge>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="systemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="grid_tied">Grid-Tied</SelectItem>
                        <SelectItem value="off_grid">Off-Grid</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>
                Equipment and services for this quote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.equipmentId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equipment</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                handleEquipmentChange(index, value)
                              }
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder="Select equipment"
                                    className="w-full"
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {equipment.map((eq) => (
                                  <SelectItem key={eq._id} value={eq._id}>
                                    <div className="flex flex-col">
                                      <div className="font-medium">
                                        {eq.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {eq.category}
                                        {eq.manufacturer &&
                                          ` • ${eq.manufacturer}`}
                                        {eq.model && ` • ${eq.model}`}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {field.value && (
                              <div className="mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {
                                    equipment.find(
                                      (eq) => eq._id === field.value
                                    )?.category
                                  }
                                </Badge>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Item description"
                                className="w-[50ch]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 1)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`lineItems.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Line Total:</span>
                        <span className="font-medium">
                          {formatCurrency(
                            (form.watch(`lineItems.${index}.quantity`) || 0) *
                              (form.watch(`lineItems.${index}.unitPrice`) || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addLineItem}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line Item
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notesForCustomer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes for Customer</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes or information for the customer..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">
                  Total Quote Amount:
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
              <Separator className="my-4" />
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 max-w-sm"
                >
                  {isSubmitting ? "Creating Quote..." : "Create Quote"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};
