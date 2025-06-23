import React from "react";
import ProjectDetailClient from "../../../../../components/ProjectDetailClient";

interface ProjectPageProps {
  params: Promise<{
    orgSlug: string;
    projectId: string;
  }>;
}

const ProjectPage = async ({ params }: ProjectPageProps) => {
  const { orgSlug, projectId } = await params;

  return <ProjectDetailClient projectId={projectId} orgSlug={orgSlug} />;
};

export default ProjectPage;
