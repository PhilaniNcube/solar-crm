"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface OrganizationRedirectProps {
  fallback?: string;
}

export function OrganizationRedirect({
  fallback = "/dashboard",
}: OrganizationRedirectProps) {
  const { orgSlug } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (orgSlug) {
      router.push(`/${orgSlug}/dashboard`);
    } else {
      router.push(fallback);
    }
  }, [orgSlug, router, fallback]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
