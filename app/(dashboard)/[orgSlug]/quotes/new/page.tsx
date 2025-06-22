import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { CreateQuoteForm } from "@/components/CreateQuoteForm";
import { Id } from "@/convex/_generated/dataModel";

interface NewQuotePageProps {
  params: Promise<{
    orgSlug: string;
  }>;
  searchParams: Promise<{
    leadId?: string;
  }>;
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const NewQuotePage = async ({ params, searchParams }: NewQuotePageProps) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { orgSlug } = await params;
  const { leadId } = await searchParams;

  try {
    // If leadId is provided, fetch the specific lead with customer details
    if (leadId) {
      const leadWithCustomer = await convex.query(
        api.leads.getLeadWithCustomer,
        {
          leadId: leadId as Id<"leads">,
          orgSlug,
        }
      );

      if (!leadWithCustomer) {
        // Lead not found, redirect to quotes page or show error
        redirect(`/${orgSlug}/quotes`);
      }

      return (
        <CreateQuoteForm
          orgSlug={orgSlug}
          prefilledLead={{
            id: leadWithCustomer._id,
            customer: leadWithCustomer.customer,
          }}
        />
      );
    }

    // If no leadId, fetch all leads so user can select one
    const allLeads = await convex.query(api.leads.leads, { orgSlug });

    if (allLeads.length === 0) {
      // No leads available, redirect to create a lead first
      redirect(
        `/${orgSlug}/leads/new?redirect=${encodeURIComponent(
          `/${orgSlug}/quotes/new`
        )}`
      );
    }

    // Transform leads to include customer data
    const leadsWithCustomers = allLeads.map((lead) => ({
      _id: lead._id,
      customer: {
        _id: lead.customerId,
        name: lead.customerName,
        type: lead.customerType as "residential" | "business",
      },
    }));

    return <CreateQuoteForm orgSlug={orgSlug} allLeads={leadsWithCustomers} />;
  } catch (error) {
    console.error("Error loading data for new quote:", error);
    redirect(`/${orgSlug}/quotes`);
  }
};

export default NewQuotePage;
