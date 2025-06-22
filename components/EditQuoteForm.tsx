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

const lineItemSchema = z.object({
  equipmentId: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
});

const quoteSchema = z.object({
  systemType: z.enum(["grid_tied", "off_grid", "hybrid"]),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "At least one line item is required"),
  notesForCustomer: z.string().optional(),
  status: z.enum(["draft", "sent", "accepted", "rejected"]).optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteWithDetails {
  _id: Id<"quotes">;
  _creationTime: number;
  slug: string;
  userId: string;
  customerId: Id<"customers">;
  version: number;
  status: "draft" | "sent" | "accepted" | "rejected";
  systemType: "grid_tied" | "off_grid" | "hybrid";
  totalPrice: number;
  lineItems: Array<{
    equipmentId: Id<"equipment">;
    description: string;
    quantity: number;
    unitPrice: number;
    equipment?: {
      _id: Id<"equipment">;
      name: string;
      manufacturer?: string;
      model?: string;
      price?: number;
    } | null;
  }>;
  notesForCustomer?: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  customer: {
    _id: Id<"customers">;
    name: string;
    type: "residential" | "business";
  };
}

interface EditQuoteFormProps {
  orgSlug: string;
  quote: QuoteWithDetails;
}

export const EditQuoteForm: React.FC<EditQuoteFormProps> = ({
  orgSlug,
  quote,
}) => {
  const { user } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateQuote = useMutation(api.quotes.updateQuote);

  // Fetch equipment for the organization
  const equipment = useQuery(api.equipment.getEquipment, { orgSlug });

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      systemType: quote.systemType,
      lineItems: quote.lineItems.map((item) => ({
        equipmentId: item.equipmentId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      notesForCustomer: quote.notesForCustomer || "",
      status: quote.status,
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
    const selectedEquipment = equipment?.find(
      (eq: any) => eq._id === equipmentId
    );
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
      await updateQuote({
        quoteId: quote._id,
        orgSlug,
        userId: user.id,
        systemType: data.systemType,
        lineItems: data.lineItems.map((item) => ({
          equipmentId: item.equipmentId as Id<"equipment">,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        notesForCustomer: data.notesForCustomer,
        status: data.status,
      });

      router.push(`/${orgSlug}/quotes/${quote._id}`);
    } catch (error) {
      console.error("Error updating quote:", error);
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
        <h1 className="text-3xl font-bold">Edit Quote</h1>
        <p className="text-muted-foreground">
          Quote #{quote.version} for {quote.customer.name}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
              <CardDescription>Update the quote information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Customer:</span>
                  <span>{quote.customer.name}</span>
                  <Badge variant="outline">{quote.customer.type}</Badge>
                </div>
              </div>

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

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
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
                                  <SelectValue placeholder="Select equipment" />
                                </SelectTrigger>
                              </FormControl>{" "}
                              <SelectContent>
                                {equipment.map((eq: any) => (
                                  <SelectItem key={eq._id} value={eq._id}>
                                    <div>
                                      <div className="font-medium">
                                        {eq.name}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {eq.manufacturer} {eq.model} - $
                                        {eq.price?.toFixed(2) || "0.00"}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                          $
                          {(
                            (form.watch(`lineItems.${index}.quantity`) || 0) *
                            (form.watch(`lineItems.${index}.unitPrice`) || 0)
                          ).toFixed(2)}
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
                  ${calculateTotal().toFixed(2)}
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
                  className="flex-1"
                >
                  {isSubmitting ? "Updating Quote..." : "Update Quote"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};
