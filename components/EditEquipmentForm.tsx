"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Doc } from "@/convex/_generated/dataModel";

const equipmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(
    [
      "Solar Panel",
      "Inverter",
      "Battery",
      "Mounting System",
      "Electrical",
      "Tools",
      "Other",
    ],
    { required_error: "Category is required" }
  ),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce
    .number()
    .min(0, "Price must be positive")
    .optional()
    .or(z.literal("")),
  specifications: z
    .array(
      z.object({
        key: z.string().min(1, "Specification name is required"),
        value: z.string().min(1, "Specification value is required"),
      })
    )
    .optional(),
  warrantyPeriod: z.string().optional(),
  isActive: z.boolean(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface EditEquipmentFormProps {
  orgSlug: string;
  equipment: Doc<"equipment">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const equipmentCategories = [
  "Solar Panel",
  "Inverter",
  "Battery",
  "Mounting System",
  "Electrical",
  "Tools",
  "Other",
] as const;

export function EditEquipmentForm({
  orgSlug,
  equipment,
  open,
  onOpenChange,
  onSuccess,
}: EditEquipmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId } = useAuth();
  const updateEquipment = useMutation(api.equipment.updateEquipment);

  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: "",
      category: "Solar Panel",
      manufacturer: "",
      model: "",
      description: "",
      price: "",
      specifications: [],
      warrantyPeriod: "",
      isActive: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "specifications",
  });

  // Update form when equipment changes
  useEffect(() => {
    if (equipment && open) {
      // Transform specifications object to array format
      const specificationsArray = equipment.specifications
        ? Object.entries(equipment.specifications).map(([key, value]) => ({
            key,
            value: String(value),
          }))
        : [];

      form.reset({
        name: equipment.name || "",
        category: equipment.category || "Solar Panel",
        manufacturer: equipment.manufacturer || "",
        model: equipment.model || "",
        description: equipment.description || "",
        price: equipment.price || "",
        specifications: specificationsArray,
        warrantyPeriod: equipment.warrantyPeriod || "",
        isActive: equipment.isActive ?? true,
      });
    }
  }, [equipment, open, form]);

  const onSubmit = async (data: EquipmentFormData) => {
    if (!userId) {
      toast.error("You must be logged in to update equipment");
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean up the data - convert empty strings to undefined for optional numeric fields
      const cleanData = {
        ...data,
        price: data.price === "" ? undefined : data.price,
        // Transform specifications array to object
        specifications: data.specifications?.reduce((acc, spec) => {
          if (spec.key && spec.value) {
            acc[spec.key] = spec.value;
          }
          return acc;
        }, {} as Record<string, string>),
      };

      await updateEquipment({
        equipmentId: equipment._id,
        orgSlug,
        userId,
        ...cleanData,
      });

      toast.success("Equipment updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating equipment:", error);
      toast.error("Failed to update equipment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Equipment</DialogTitle>
          <DialogDescription>
            Update equipment details in your inventory catalog.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Equipment name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {equipmentCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input placeholder="Manufacturer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Model number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Equipment description"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dynamic Specifications Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  Specifications
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ key: "", value: "" })}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Specification
                </Button>
              </div>

              {fields.length > 0 && (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`specifications.${index}.key`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Specification name (e.g., Power Output)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`specifications.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Value (e.g., 400W)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="flex items-center justify-center min-w-[40px]"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {fields.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No specifications added. Click "Add Specification" to add
                  custom specifications for this equipment.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="warrantyPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty Period</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 25 years" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Equipment is available for use in quotes and projects
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Equipment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
