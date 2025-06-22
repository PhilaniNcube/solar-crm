import ProjectStatuses from "@/components/project-statuses";
import ProjectsHeader from "@/components/projects-header";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ProjectsPageProps {
  params: Promise<{ orgSlug: string }>;
}

const Projects = async ({ params }: ProjectsPageProps) => {
  const { orgSlug } = await params;

  const preLoadedProjects = await preloadQuery(api.projects.projects, {
    orgSlug,
  });

  const preloadedTasks = await preloadQuery(api.tasks.getAllTasks, {
    orgSlug,
  });

  return (
    <div className="p-4">
      <ProjectsHeader orgSlug={orgSlug} />
      <ProjectStatuses
        orgSlug={orgSlug}
        preLoadedProjects={preLoadedProjects}
        preloadedTasks={preloadedTasks}
      />
    </div>
  );
};

export default Projects;
