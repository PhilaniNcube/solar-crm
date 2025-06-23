import React from "react";
import { CreateEquipmentWithParser } from "../../../../../components/CreateEquipmentWithParser";

interface EquipmentParserPageProps {
  params: {
    orgSlug: string;
  };
}

const EquipmentParserPage = ({ params }: EquipmentParserPageProps) => {
  return (
    <div className="container mx-auto py-6">
      <CreateEquipmentWithParser
        orgSlug={params.orgSlug}
        onSuccess={() => {
          // Handle success - could redirect or show toast
          console.log("Equipment created successfully");
        }}
      />
    </div>
  );
};

export default EquipmentParserPage;
