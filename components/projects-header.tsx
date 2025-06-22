import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

const ProjectsHeader = ({ orgSlug }: { orgSlug: string }) => {
  return (
    <div className="flex items-start justify-between">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600 mt-1">
          Manage your solar installation projects
        </p>
      </div>
      <Link
        className="inline-flex items-center "
        href={`/${orgSlug}/projects/new`}
      >
        <Button size="lg">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </Link>
    </div>
  );
};

export default ProjectsHeader;
