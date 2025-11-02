/**
 * Assign mechanic dialog for Kanban cards
 */
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { WorkOrderCard } from "../types/kanban.types";

interface AssignMechanicDialogProps {
  card: WorkOrderCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Mechanic {
  id: string;
  name: string;
}

export const AssignMechanicDialog: React.FC<AssignMechanicDialogProps> = ({
  card,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchMechanics();
      if (card?.assigned_mechanic_id) {
        setSelectedMechanic(card.assigned_mechanic_id);
      }
    }
  }, [open, card]);

  const fetchMechanics = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("user_id, profiles:user_id(id, name)")
        .eq("is_active", true);

      if (error) throw error;

      const mechanicList = (data || [])
        .map((emp: any) => {
          const profile = Array.isArray(emp.profiles)
            ? emp.profiles[0]
            : emp.profiles;
          return profile ? { id: profile.id, name: profile.name } : null;
        })
        .filter(Boolean) as Mechanic[];

      setMechanics(mechanicList);
    } catch (error: any) {
      console.error("Error fetching mechanics:", error);
      toast({
        title: "Error",
        description: "Failed to load mechanics",
        variant: "destructive",
      });
    }
  };

  const handleAssign = async () => {
    if (!card || !selectedMechanic) return;

    setLoading(true);
    try {
      // Update ticket with primary mechanic
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ primary_mechanic_id: selectedMechanic })
        .eq("id", card.id);

      if (updateError) throw updateError;

      // Create or update ticket assignment
      const { error: assignError } = await supabase
        .from("ticket_assignments")
        .upsert({
          ticket_id: card.id,
          employee_id: selectedMechanic,
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          is_auto_assigned: false,
        });

      if (assignError) throw assignError;

      toast({
        title: "Success",
        description: "Mechanic assigned successfully",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error assigning mechanic:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign mechanic",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Mechanic</DialogTitle>
          <DialogDescription>
            Assign a mechanic to work order {card.ticket_id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="mechanic">Select Mechanic</Label>
            <Select value={selectedMechanic} onValueChange={setSelectedMechanic}>
              <SelectTrigger id="mechanic">
                <SelectValue placeholder="Choose a mechanic" />
              </SelectTrigger>
              <SelectContent>
                {mechanics.map((mechanic) => (
                  <SelectItem key={mechanic.id} value={mechanic.id}>
                    {mechanic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedMechanic || loading}
          >
            {loading ? "Assigning..." : "Assign Mechanic"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
