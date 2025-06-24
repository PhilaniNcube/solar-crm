import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getRecentActivity } from "@/lib/queries/activity";
import DashboardClient from "@/components/DashboardClient";

interface DashboardPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { orgSlug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const activity = await getRecentActivity(orgSlug);

  return (
    <DashboardClient orgSlug={orgSlug} userId={userId} activity={activity} />
  );
}
