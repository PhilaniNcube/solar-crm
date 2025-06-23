import React from "react";
import { CreateEquipmentWithParser } from "../../../../../components/CreateEquipmentWithParser";

interface EquipmentParserPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

const EquipmentParserPage = async ({ params }: EquipmentParserPageProps) => {
  const { orgSlug } = await params;

  return (
    <div className="container mx-auto py-6">
      <CreateEquipmentWithParser
        orgSlug={orgSlug}
        onSuccess={() => {
          // Handle success - could redirect or show toast
          console.log("Equipment created successfully");
        }}
      />
    </div>
  );
};

export default EquipmentParserPage;
