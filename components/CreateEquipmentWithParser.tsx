"use client";

import { useState } from "react";
import { PdfEquipmentParser } from "./PdfEquipmentParser";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FileText, Edit3, Sparkles } from "lucide-react";
import { z } from "zod";

// Equipment schema
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
  price: z.coerce.number().min(0).optional().or(z.literal("")),
  specifications: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  warrantyPeriod: z.string().optional(),
  isActive: z.boolean(),
});

type EquipmentData = z.infer<typeof equipmentSchema>;

interface CreateEquipmentWithParserProps {
  orgSlug: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateEquipmentWithParser = ({
  orgSlug,
  onSuccess,
  onCancel,
}: CreateEquipmentWithParserProps) => {
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [parsedEquipment, setParsedEquipment] = useState<EquipmentData | null>(
    null
  );
  const [confidence, setConfidence] = useState<number | null>(null);

  const handleEquipmentParsed = (equipment: EquipmentData, conf: number) => {
    setParsedEquipment(equipment);
    setConfidence(conf);
    setActiveTab("manual"); // Switch to manual tab to review/edit
  };

  const handleParserError = (error: string) => {
    console.error("PDF parsing error:", error);
    // Optionally show toast notification
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Add New Equipment</h1>
        <p className="text-muted-foreground">
          Upload a PDF datasheet for automatic parsing or create equipment
          manually
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "upload" | "manual")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Upload PDF</span>
            {parsedEquipment && (
              <Sparkles className="h-3 w-3 text-yellow-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <Edit3 className="h-4 w-4" />
            <span>Manual Entry</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="space-y-4">
          {" "}
          <PdfEquipmentParser
            orgSlug={orgSlug}
            onEquipmentParsed={handleEquipmentParsed}
            onEquipmentCreated={onSuccess}
            onError={handleParserError}
          />
          {parsedEquipment && confidence !== null && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Equipment data ready for review
                    </span>
                  </div>
                  <Button onClick={() => setActiveTab("manual")} size="sm">
                    Review & Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>{" "}
        <TabsContent value="manual" className="space-y-4">
          {parsedEquipment && confidence !== null && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-800">
                      Pre-filled from PDF (Confidence:{" "}
                      {Math.round(confidence * 100)}%)
                    </p>
                    <p className="text-sm text-blue-700">
                      Data extracted from PDF. You can create equipment manually
                      below or integrate this data.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setParsedEquipment(null);
                      setConfidence(null);
                    }}
                  >
                    Clear Pre-filled Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Manual Equipment Entry</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create equipment entry manually
                {parsedEquipment &&
                  " or use the extracted PDF data as reference"}
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Manual equipment creation form would go here
                </p>
                <p className="text-sm text-gray-500">
                  This would integrate with your existing CreateEquipmentForm
                  component
                </p>
                {parsedEquipment && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-2">
                      Extracted Data:
                    </p>
                    <p className="text-sm text-blue-700">
                      {parsedEquipment.name} - {parsedEquipment.category}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
