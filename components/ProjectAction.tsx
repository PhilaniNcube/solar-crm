"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { CreateProjectDialog } from "./CreateProjectDialog";

interface ProjectActionProps {
  quote: Doc<"quotes"> & { customer: Doc<"customers"> };
  orgSlug: string;
}

export function ProjectAction({ quote, orgSlug }: ProjectActionProps) {
  const existingProject = useQuery(api.projects.getProjectByQuote, {
    quoteId: quote._id,
    orgSlug,
  });

  // Show loading state while checking for existing project
  if (existingProject === undefined) {
    return (
      <Button disabled className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        <span>Loading...</span>
      </Button>
    );
  }

  // If project exists, show link to project
  if (existingProject) {
    return (
      <Link href={`/${orgSlug}/projects/${existingProject._id}`}>
        <Button variant="outline" className="flex items-center space-x-2">
          <ExternalLink className="h-4 w-4" />
          <span>View Project</span>
        </Button>
      </Link>
    );
  }

  // If no project exists, show create project dialog
  return <CreateProjectDialog quote={quote} orgSlug={orgSlug} />;
}
