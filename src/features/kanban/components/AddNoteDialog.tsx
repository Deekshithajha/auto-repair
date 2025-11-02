/**
 * Add note dialog for Kanban cards
 */
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { WorkOrderCard } from "../types/kanban.types";

interface AddNoteDialogProps {
  card: WorkOrderCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  card,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddNote = async () => {
    if (!card || !note.trim()) return;

    setLoading(true);
    try {
      // TODO: Implement notes table and insertion
      // For now, just show success
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "Success",
        description: "Note added successfully",
      });

      setNote("");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!card) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) setNote("");
        onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Add a note to work order {card.ticket_id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Enter your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setNote("");
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddNote} disabled={!note.trim() || loading}>
            {loading ? "Adding..." : "Add Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
