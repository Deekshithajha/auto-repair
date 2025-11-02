/**
 * Ticket detail view dialog for Kanban cards
 */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Wrench, Clock, AlertCircle } from "lucide-react";
import type { WorkOrderCard } from "../types/kanban.types";
import { getStatusLabel } from "../utils/status.config";

interface TicketDetailDialogProps {
  card: WorkOrderCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TicketDetailDialog: React.FC<TicketDetailDialogProps> = ({
  card,
  open,
  onOpenChange,
}) => {
  if (!card) return null;

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    normal: "bg-gray-100 text-gray-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{card.ticket_id}</DialogTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="capitalize">
                {getStatusLabel(card.status)}
              </Badge>
              {card.priority && (
                <Badge className={priorityColors[card.priority] || ""}>
                  {card.priority.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
          <DialogDescription>Work Order Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Vehicle Information */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Vehicle Information
            </h3>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Make & Model</span>
                  <p className="font-medium">
                    {card.vehicle_make} {card.vehicle_model}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Year</span>
                  <p className="font-medium">{card.vehicle_year}</p>
                </div>
              </div>
              {card.vehicle_plate && (
                <div>
                  <span className="text-sm text-muted-foreground">License Plate</span>
                  <p className="font-medium">{card.vehicle_plate}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Description */}
          {card.description && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Description
              </h3>
              <p className="text-sm bg-muted p-4 rounded-lg">{card.description}</p>
            </div>
          )}

          <Separator />

          {/* Assignment */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Assignment
            </h3>
            <div className="bg-muted p-4 rounded-lg">
              {card.assigned_mechanic_name ? (
                <div>
                  <span className="text-sm text-muted-foreground">Assigned Mechanic</span>
                  <p className="font-medium">{card.assigned_mechanic_name}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not assigned yet</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h3>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Created</span>
                <p className="font-medium">
                  {new Date(card.created_at).toLocaleString()}
                </p>
              </div>
              {card.started_at && (
                <div>
                  <span className="text-sm text-muted-foreground">Started</span>
                  <p className="font-medium">
                    {new Date(card.started_at).toLocaleString()}
                  </p>
                </div>
              )}
              {card.est_complete_at && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    Estimated Completion
                  </span>
                  <p className="font-medium">
                    {new Date(card.est_complete_at).toLocaleString()}
                  </p>
                </div>
              )}
              {card.time_in_status_seconds !== undefined && (
                <div>
                  <span className="text-sm text-muted-foreground">
                    Time in Current Status
                  </span>
                  <p className="font-medium">
                    {Math.floor(card.time_in_status_seconds / 3600)}h{" "}
                    {Math.floor((card.time_in_status_seconds % 3600) / 60)}m
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Attachments & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Notes</span>
              <p className="font-medium">{card.notes_count || 0}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Attachments</span>
              <p className="font-medium">{card.attachments_count || 0}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
