import React from "react";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { EditQuoteForm } from "@/components/EditQuoteForm";
import { Id } from "@/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";

interface EditQuotePageProps {
  params: Promise<{
    orgSlug: string;
    quoteId: string;
  }>;
}

const EditQuotePage = async ({ params }: EditQuotePageProps) => {
  const { orgSlug, quoteId } = await params;

  const quote = await fetchQuery(api.quotes.getQuote, {
    quoteId: quoteId as Id<"quotes">,
    orgSlug,
  });

  if (!quote) {
    // Quote not found, redirect to quotes list
    redirect(`/${orgSlug}/quotes`);
  }

  return <EditQuoteForm orgSlug={orgSlug} quote={quote} />;
};

export default EditQuotePage;
