import { EquipmentClient } from "@/components/EquipmentClient";

interface EquipmentPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function EquipmentPage({ params }: EquipmentPageProps) {
  const { orgSlug } = await params;
  return <EquipmentClient orgSlug={orgSlug} />;
}
