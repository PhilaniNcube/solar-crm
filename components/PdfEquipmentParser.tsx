"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
  Edit3,
  Save,
  Plus,
  Trash2,
} from "lucide-react";
import { z } from "zod";

// Equipment schema matching the API
const equipmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum([
    "Solar Panel",
    "Inverter",
    "Battery",
    "Mounting System",
    "Electrical",
    "Tools",
    "Other",
  ]),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0).default(0),
  specifications: z
    .array(
      z.object({
        key: z.string().min(1, "Specification name is required"),
        value: z.string().min(1, "Specification value is required"),
      })
    )
    .optional(),
  warrantyPeriod: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Form schema with proper types for react-hook-form
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum([
    "Solar Panel",
    "Inverter",
    "Battery",
    "Mounting System",
    "Electrical",
    "Tools",
    "Other",
  ]),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  specifications: z
    .array(
      z.object({
        key: z.string().min(1, "Specification name is required"),
        value: z.string().min(1, "Specification value is required"),
      })
    )
    .optional()
    .default([]),
  warrantyPeriod: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

type EquipmentData = z.infer<typeof equipmentSchema>;

interface ParseResponse {
  success: boolean;
  equipment?: EquipmentData;
  error?: string;
  confidence?: number;
}

interface PdfEquipmentParserProps {
  orgSlug: string;
  onEquipmentParsed?: (equipment: EquipmentData, confidence: number) => void;
  onEquipmentCreated?: (equipment: EquipmentData) => void;
  onError?: (error: string) => void;
}

export const PdfEquipmentParser = ({
  orgSlug,
  onEquipmentParsed,
  onEquipmentCreated,
  onError,
}: PdfEquipmentParserProps) => {
  const { user } = useUser();
  const createEquipmentMutation = useMutation(api.equipment.createEquipment);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedEquipment, setParsedEquipment] = useState<EquipmentData | null>(
    null
  );
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      name: "",
      category: "Other" as
        | "Solar Panel"
        | "Inverter"
        | "Battery"
        | "Mounting System"
        | "Electrical"
        | "Tools"
        | "Other",
      manufacturer: "",
      model: "",
      description: "",
      price: 0,
      specifications: [] as Array<{ key: string; value: string }>,
      warrantyPeriod: "",
      isActive: true,
    },
  });
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      setError(null);
      setSuccessMessage(null);
      setParsedEquipment(null);
      setConfidence(null);
      setIsEditing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleParseDocument = async () => {
    if (!uploadedFile) return;
    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const response = await fetch("/api/documents/parse", {
        method: "POST",
        body: formData,
      });

      const result: ParseResponse = await response.json();

      if (result.success && result.equipment) {
        setParsedEquipment(result.equipment);
        setConfidence(result.confidence || 0); // Populate the form with parsed data
        form.reset({
          name: result.equipment.name || "",
          category: result.equipment.category,
          manufacturer: result.equipment.manufacturer || "",
          model: result.equipment.model || "",
          description: result.equipment.description || "",
          price: result.equipment.price || 0,
          specifications: result.equipment.specifications || [],
          warrantyPeriod: result.equipment.warrantyPeriod || "",
          isActive: result.equipment.isActive ?? true,
        });

        onEquipmentParsed?.(result.equipment, result.confidence || 0);
      } else {
        const errorMessage = result.error || "Failed to parse document";
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = "Failed to upload or parse document";
      setError(errorMessage);
      onError?.(errorMessage);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };
  const handleClear = () => {
    setUploadedFile(null);
    setParsedEquipment(null);
    setConfidence(null);
    setError(null);
    setSuccessMessage(null);
    setIsEditing(false);
  };

  const handleEditEquipment = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to parsed values
    if (parsedEquipment) {
      form.reset({
        name: parsedEquipment.name || "",
        category: parsedEquipment.category,
        manufacturer: parsedEquipment.manufacturer || "",
        model: parsedEquipment.model || "",
        description: parsedEquipment.description || "",
        price: parsedEquipment.price || 0,
        specifications: parsedEquipment.specifications || [],
        warrantyPeriod: parsedEquipment.warrantyPeriod || "",
        isActive: parsedEquipment.isActive ?? true,
      });
    }
  };
  const handleSubmitEquipment = async (data: any) => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert specifications array to the format expected by Convex
      const specificationsObject = data.specifications?.reduce(
        (acc: any, spec: any) => {
          if (spec.key && spec.value) {
            acc[spec.key] = spec.value;
          }
          return acc;
        },
        {}
      );

      // Create equipment using Convex mutation
      const equipmentId = await createEquipmentMutation({
        orgSlug,
        userId: user.id,
        name: data.name,
        category: data.category,
        manufacturer: data.manufacturer || undefined,
        model: data.model || undefined,
        description: data.description || undefined,
        price: data.price || undefined,
        specifications: specificationsObject,
        warrantyPeriod: data.warrantyPeriod || undefined,
        isActive: data.isActive ?? true,
      });

      // Create the equipment data object for the callback
      const equipmentData: EquipmentData = {
        name: data.name,
        category: data.category,
        manufacturer: data.manufacturer,
        model: data.model,
        description: data.description,
        price: data.price,
        specifications: data.specifications,
        warrantyPeriod: data.warrantyPeriod,
        isActive: data.isActive,
      }; // Call the callback with the created equipment data
      onEquipmentCreated?.(equipmentData);

      // Show success message
      setSuccessMessage(
        `Equipment "${data.name}" has been created successfully!`
      );

      // Reset the component state
      setIsEditing(false);
      setParsedEquipment(null);
      setConfidence(null);
      setUploadedFile(null);

      // Reset the form
      form.reset({
        name: "",
        category: "Other",
        manufacturer: "",
        model: "",
        description: "",
        price: 0,
        specifications: [],
        warrantyPeriod: "",
        isActive: true,
      });
    } catch (err) {
      console.error("Error creating equipment:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create equipment";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSpecification = () => {
    const currentSpecs = form.getValues("specifications") || [];
    form.setValue("specifications", [...currentSpecs, { key: "", value: "" }]);
  };

  const removeSpecification = (index: number) => {
    const currentSpecs = form.getValues("specifications") || [];
    form.setValue(
      "specifications",
      currentSpecs.filter((_, i) => i !== index)
    );
  };

  const formatPrice = (price: number | string | undefined) => {
    if (!price || price === "") return "Not specified";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(numPrice) ? "Not specified" : `$${numPrice.toLocaleString()}`;
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return "text-green-600";
    if (conf >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return "High";
    if (conf >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>PDF Equipment Parser</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload a PDF datasheet to automatically extract equipment
          specifications
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive
                  ? "Drop the PDF here"
                  : "Drag & drop a PDF datasheet here, or click to select"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports PDF files up to 10MB
              </p>
            </div>
          </div>
        </div>
        {/* Selected File */}
        {uploadedFile && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {/* Parse Button */}
        {uploadedFile && !parsedEquipment && (
          <Button
            onClick={handleParseDocument}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing Document...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Parse Equipment Data
              </>
            )}
          </Button>
        )}{" "}
        {/* Success Display */}
        {successMessage && (
          <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Success!</p>
              <p className="text-sm text-green-700 mt-1">{successMessage}</p>
            </div>
          </div>
        )}
        {/* Error Display */}
        {error && (
          <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Parsing Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}{" "}
        {/* Parsed Equipment Display */}
        {parsedEquipment && confidence !== null && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Equipment Data Extracted
                </span>
              </div>
              <Badge className={getConfidenceColor(confidence)}>
                {getConfidenceLabel(confidence)} Confidence (
                {Math.round(confidence * 100)}%)
              </Badge>
            </div>

            <Separator />

            {!isEditing ? (
              // Display Mode
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Basic Information
                    </h3>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Name
                      </Label>
                      <p className="mt-1 text-sm text-gray-900">
                        {parsedEquipment.name}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Category
                      </Label>
                      <Badge variant="outline" className="mt-1">
                        {parsedEquipment.category}
                      </Badge>
                    </div>

                    {parsedEquipment.manufacturer && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Manufacturer
                        </Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {parsedEquipment.manufacturer}
                        </p>
                      </div>
                    )}

                    {parsedEquipment.model && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Model
                        </Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {parsedEquipment.model}
                        </p>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Price
                      </Label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatPrice(parsedEquipment.price)}
                      </p>
                    </div>

                    {parsedEquipment.warrantyPeriod && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Warranty
                        </Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {parsedEquipment.warrantyPeriod}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Specifications */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Specifications
                    </h3>

                    {parsedEquipment.specifications &&
                    parsedEquipment.specifications.length > 0 ? (
                      <div className="space-y-2">
                        {parsedEquipment.specifications.map((spec, index) => (
                          <div
                            key={index}
                            className="flex justify-between py-1"
                          >
                            <span className="text-sm font-medium text-gray-700">
                              {spec.key}:
                            </span>
                            <span className="text-sm text-gray-900">
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No specifications extracted
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {parsedEquipment.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <p className="mt-1 text-sm text-gray-900">
                      {parsedEquipment.description}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleEditEquipment}
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit & Create Equipment
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="flex-1"
                  >
                    Parse Another Document
                  </Button>
                </div>
              </>
            ) : (
              // Edit Mode
              <>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmitEquipment)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">
                          Basic Information
                        </h3>

                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name *</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Solar Panel">
                                    Solar Panel
                                  </SelectItem>
                                  <SelectItem value="Inverter">
                                    Inverter
                                  </SelectItem>
                                  <SelectItem value="Battery">
                                    Battery
                                  </SelectItem>
                                  <SelectItem value="Mounting System">
                                    Mounting System
                                  </SelectItem>
                                  <SelectItem value="Electrical">
                                    Electrical
                                  </SelectItem>
                                  <SelectItem value="Tools">Tools</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="manufacturer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Manufacturer</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
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

                        <FormField
                          control={form.control}
                          name="warrantyPeriod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Warranty Period</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="e.g., 25 years"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Specifications */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">
                            Specifications
                          </h3>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addSpecification}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Spec
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {form.watch("specifications")?.map((_, index) => (
                            <div key={index} className="flex gap-2 items-end">
                              <FormField
                                control={form.control}
                                name={`specifications.${index}.key`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Specification name"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`specifications.${index}.value`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input {...field} placeholder="Value" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSpecification(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {(!form.watch("specifications") ||
                            form.watch("specifications")?.length === 0) && (
                            <p className="text-sm text-gray-500 italic">
                              No specifications added
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Create Equipment
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
