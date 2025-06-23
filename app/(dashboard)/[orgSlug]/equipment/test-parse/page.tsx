"use client";

import React from "react";
import { use } from "react";
import { PdfEquipmentParser } from "../../../../../components/PdfEquipmentParser";

interface ParseTestPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

const ParseTestPage = ({ params }: ParseTestPageProps) => {
  const { orgSlug } = use(params);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">PDF Equipment Parser Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the PDF parsing functionality with equipment datasheets
        </p>
      </div>

      <PdfEquipmentParser
        orgSlug={orgSlug}
        onEquipmentParsed={(equipment, confidence) => {
          console.log("Equipment parsed:", equipment);
          console.log("Confidence:", confidence);
        }}
        onEquipmentCreated={(equipment) => {
          console.log("Equipment created:", equipment);
          alert("Equipment created successfully!");
        }}
        onError={(error) => {
          console.error("Parsing error:", error);
        }}
      />
    </div>
  );
};

export default ParseTestPage;
