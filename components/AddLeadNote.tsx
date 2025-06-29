"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Send } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface AddLeadNoteProps {
  slug: string;
  leadId: Id<"leads">;
  onNoteAdded?: () => void;
}

export function AddLeadNote({ slug, leadId, onNoteAdded }: AddLeadNoteProps) {
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useUser();
  const addNote = useMutation(api.leadNotes.addLeadNote);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter a note");
      return;
    }

    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsSubmitting(true);

    try {
      await addNote({
        slug,
        userId: user.id,
        leadId,
        content: content.trim(),
      });

      setContent("");
      setIsExpanded(false);
      onNoteAdded?.();
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Failed to add note:", error);
      toast.error("Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        variant="outline"
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Note
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Add New Note</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your note here..."
            className="min-h-[100px] resize-none"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsExpanded(false);
                setContent("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? (
                "Adding..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Add Note
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
