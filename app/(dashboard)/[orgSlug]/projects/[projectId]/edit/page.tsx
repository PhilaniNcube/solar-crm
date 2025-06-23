import React from "react";
import { EditProjectForm } from "../../../../../../components/EditProjectForm";

interface EditProjectPageProps {
  params: {
    orgSlug: string;
    projectId: string;
  };
}

const EditProjectPage = ({ params }: EditProjectPageProps) => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-muted-foreground mt-2">
          Update project status and timeline
        </p>
      </div>
      <EditProjectForm projectId={params.projectId} orgSlug={params.orgSlug} />
    </div>
  );
};

export default EditProjectPage;
