import React from "react";
import { EditProjectForm } from "../../../../../../components/EditProjectForm";

interface EditProjectPageProps {
  params: Promise<{
    orgSlug: string;
    projectId: string;
  }>;
}

const EditProjectPage = async ({ params }: EditProjectPageProps) => {
  const { orgSlug, projectId } = await params;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-muted-foreground mt-2">
          Update project status and timeline
        </p>
      </div>
      <EditProjectForm projectId={projectId} orgSlug={orgSlug} />
    </div>
  );
};

export default EditProjectPage;
