import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import QuotesClient from "@/components/QuotesClient";

interface QuotesPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function QuotesPage({ params }: QuotesPageProps) {
  const { orgSlug } = await params;

  return <QuotesClient orgSlug={orgSlug} />;
}
