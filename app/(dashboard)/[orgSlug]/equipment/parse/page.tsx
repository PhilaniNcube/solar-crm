"use client";

import React from "react";
import { use } from "react";
import { PdfEquipmentParser } from "../../../../../components/PdfEquipmentParser";

interface EquipmentParserPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

const EquipmentParserPage = ({ params }: EquipmentParserPageProps) => {
  const { orgSlug } = use(params);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">PDF Equipment Parser</h1>
        <div className="mt-4 space-y-3">
          <p className="text-lg text-muted-foreground">
            Upload PDF datasheets to automatically extract and add equipment to
            your inventory
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">How it works:</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Upload:</strong> Drag and drop or select PDF
                datasheets for solar panels, inverters, batteries, and other
                equipment
              </li>
              <li>
                • <strong>AI Extraction:</strong> Our AI automatically reads the
                PDF and extracts key specifications, model numbers, and
                technical details
              </li>
              <li>
                • <strong>Review & Edit:</strong> Review the extracted data and
                make any necessary corrections before saving
              </li>
              <li>
                • <strong>Save to Inventory:</strong> Add the equipment directly
                to your organization's equipment catalog
              </li>
            </ul>
          </div>{" "}
          <p className="text-sm text-muted-foreground">
            Supported formats: PDF files up to 4MB. Works best with manufacturer
            datasheets and specification documents.
          </p>
        </div>
      </div>

      <PdfEquipmentParser
        orgSlug={orgSlug}
        onEquipmentParsed={(equipment, confidence) => {
          console.log("Equipment parsed:", equipment);
          console.log("Confidence:", confidence);
        }}
        onEquipmentCreated={(equipment) => {
          console.log("Equipment created:", equipment);
        }}
        onError={(error) => {
          console.error("Parsing error:", error);
        }}
      />
    </div>
  );
};

export default EquipmentParserPage;
