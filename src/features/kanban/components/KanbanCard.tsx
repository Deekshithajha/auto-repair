/**
 * Kanban card component
 */
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Paperclip, MoreVertical } from "lucide-react";
import type { WorkOrderCard, Priority } from "../types/kanban.types";
import { formatDistanceToNow } from "date-fns";

interface KanbanCardProps {
  card: WorkOrderCard;
  compact?: boolean;
  onView?: (id: string) => void;
  onAssign?: (id: string) => void;
  onAddNote?: (id: string) => void;
}

const priorityColors: Record<Priority, string> = {
  low: "bg-gray-500",
  normal: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export const KanbanCard: React.FC<KanbanCardProps> = ({
  card,
  compact = false,
  onView,
  onAssign,
  onAddNote,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `card-${card.id}`,
    data: {
      type: "card",
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const timeInStatus = card.time_in_status_seconds
    ? formatDistanceToNow(
        new Date(Date.now() - card.time_in_status_seconds * 1000),
        { addSuffix: false }
      )
    : formatDistanceToNow(new Date(card.updated_at), { addSuffix: false });

  const priority = card.priority || "normal";

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? "ring-2 ring-blue-500" : ""
      } ${compact ? "p-2" : "p-3"}`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-0 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm truncate">
                {card.ticket_id}
              </span>
              {card.priority && (
                <Badge
                  className={`${priorityColors[priority]} text-white text-xs px-1.5 py-0`}
                >
                  {priority}
                </Badge>
              )}
            </div>
            {!compact && card.vehicle_plate && (
              <div className="text-xs text-muted-foreground truncate">
                {card.vehicle_plate}
                {card.vehicle_make && ` • ${card.vehicle_make}`}
                {card.vehicle_model && ` ${card.vehicle_model}`}
                {card.vehicle_year && ` (${card.vehicle_year})`}
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(card.id)}>
                  View Details
                </DropdownMenuItem>
              )}
              {onAssign && (
                <DropdownMenuItem onClick={() => onAssign(card.id)}>
                  Assign Mechanic
                </DropdownMenuItem>
              )}
              {onAddNote && (
                <DropdownMenuItem onClick={() => onAddNote(card.id)}>
                  Add Note
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {!compact && card.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Mechanic */}
        {card.assigned_mechanic_name && (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs">
                {card.assigned_mechanic_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {card.assigned_mechanic_name}
            </span>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-1 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{timeInStatus}</span>
          </div>
          <div className="flex items-center gap-2">
            {card.notes_count !== undefined && card.notes_count > 0 && (
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{card.notes_count}</span>
              </div>
            )}
            {card.attachments_count !== undefined &&
              card.attachments_count > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  <span>{card.attachments_count}</span>
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

