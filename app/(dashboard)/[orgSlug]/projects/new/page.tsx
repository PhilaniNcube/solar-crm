import React from "react";
import { CreateProjectForm } from "../../../../../components/CreateProjectForm";

const NewProject = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground mt-2">
          Create a new project from an accepted customer quote
        </p>
      </div>
      <CreateProjectForm />
    </div>
  );
};

export default NewProject;
