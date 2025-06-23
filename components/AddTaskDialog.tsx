"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Plus } from "lucide-react";
import { Id } from "../convex/_generated/dataModel";

// Zod schema for task form validation
const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface AddTaskDialogProps {
  projectId: string;
  orgSlug: string;
  onTaskAdded?: () => void;
}

export const AddTaskDialog = ({
  projectId,
  orgSlug,
  onTaskAdded,
}: AddTaskDialogProps) => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProjectTask = useMutation(api.projects.createProjectTask);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = async (data: TaskFormData) => {
    if (!user) {
      console.error("User not found");
      return;
    }

    setIsSubmitting(true);

    try {
      await createProjectTask({
        orgSlug,
        userId: user.id,
        projectId: projectId as Id<"projects">,
        title: data.title,
        dueDate: data.dueDate || undefined,
      });

      console.log("Task created successfully");

      // Reset form and close dialog
      reset();
      setIsOpen(false);

      // Call callback if provided
      if (onTaskAdded) {
        onTaskAdded();
      }
    } catch (error) {
      console.error("Error creating task:", error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task for this project. Tasks help you track progress
            and milestones.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter task title..."
              className="w-full"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              {...register("dueDate")}
              className="w-full"
            />
            {errors.dueDate && (
              <p className="text-sm text-red-600">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
