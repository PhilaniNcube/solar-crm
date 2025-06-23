"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Id } from "../convex/_generated/dataModel";

// Zod schema for project update form validation
const projectUpdateSchema = z
  .object({
    status: z.enum(
      ["planning", "permitting", "installing", "commissioned", "completed"],
      {
        required_error: "Status is required",
      }
    ),
    startDate: z.string().optional(),
    completionDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.completionDate) {
        return new Date(data.startDate) <= new Date(data.completionDate);
      }
      return true;
    },
    {
      message: "Completion date must be after start date",
      path: ["completionDate"],
    }
  );

type ProjectUpdateFormData = z.infer<typeof projectUpdateSchema>;

interface EditProjectFormProps {
  projectId: string;
  orgSlug: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditProjectForm = ({
  projectId,
  orgSlug,
  onSuccess,
  onCancel,
}: EditProjectFormProps) => {
  const { user } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const project = useQuery(api.projects.getProject, {
    projectId: projectId as Id<"projects">,
    orgSlug,
  });

  const updateProject = useMutation(api.projects.updateProject);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProjectUpdateFormData>({
    resolver: zodResolver(projectUpdateSchema),
  });

  // Initialize form with project data
  useEffect(() => {
    if (project) {
      setValue("status", project.status);
      setValue("startDate", project.startDate || "");
      setValue("completionDate", project.completionDate || "");
    }
  }, [project, setValue]);

  const onSubmit = async (data: ProjectUpdateFormData) => {
    if (!user || !organization || !project) {
      console.error("User, organization, or project not found");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProject({
        projectId: projectId as Id<"projects">,
        orgSlug: organization.slug!,
        userId: user.id,
        status: data.status,
        startDate: data.startDate || undefined,
        completionDate: data.completionDate || undefined,
      });

      console.log("Project updated successfully");

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/${organization.slug}/projects/${projectId}`);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!project) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading project...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Project</CardTitle>
        <CardDescription>
          Update project details for {project.customer?.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Info Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              Project Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Customer:</span>{" "}
                <span className="font-medium">{project.customer?.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Quote:</span>{" "}
                <span className="font-medium">v{project.quote?.version}</span>
              </div>
              <div>
                <span className="text-gray-500">System Type:</span>{" "}
                <span className="font-medium capitalize">
                  {project.quote?.systemType?.replace("_", "-")}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>{" "}
                <span className="font-medium">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Project Status *</Label>
            <Select
              value={watch("status") || "planning"}
              onValueChange={(value) => setValue("status", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="permitting">Permitting</SelectItem>
                <SelectItem value="installing">Installing</SelectItem>
                <SelectItem value="commissioned">Commissioned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
              className="w-full"
            />
            {errors.startDate && (
              <p className="text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          {/* Completion Date */}
          <div className="space-y-2">
            <Label htmlFor="completionDate">Estimated Completion Date</Label>
            <Input
              id="completionDate"
              type="date"
              {...register("completionDate")}
              className="w-full"
            />
            {errors.completionDate && (
              <p className="text-sm text-red-600">
                {errors.completionDate.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (onCancel) {
                  onCancel();
                } else {
                  router.push(`/${orgSlug}/projects/${projectId}`);
                }
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
