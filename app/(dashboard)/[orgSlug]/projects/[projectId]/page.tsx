import React from "react";
import ProjectDetailClient from "../../../../../components/ProjectDetailClient";

interface ProjectPageProps {
  params: {
    orgSlug: string;
    projectId: string;
  };
}

const ProjectPage = ({ params }: ProjectPageProps) => {
  return (
    <ProjectDetailClient
      projectId={params.projectId}
      orgSlug={params.orgSlug}
    />
  );
};

export default ProjectPage;
