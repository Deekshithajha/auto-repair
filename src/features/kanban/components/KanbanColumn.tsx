/**
 * Kanban column component
 */
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KanbanCard } from "./KanbanCard";
import type { WorkOrderCard, WorkOrderStatus } from "../types/kanban.types";
import { getStatusConfig } from "../utils/status.config";

interface KanbanColumnProps {
  status: WorkOrderStatus;
  cards: WorkOrderCard[];
  compact?: boolean;
  onView?: (id: string) => void;
  onAssign?: (id: string) => void;
  onAddNote?: (id: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  cards,
  compact = false,
  onView,
  onAssign,
  onAddNote,
}) => {
  const config = getStatusConfig(status);
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: {
      type: "column",
      status,
    },
  });

  const cardIds = cards.map((c) => `card-${c.id}`);
  const wipLimit = config.wipLimit;
  const isOverLimit = wipLimit && cards.length > wipLimit;

  return (
    <div className="flex flex-col h-full min-w-[280px] max-w-[320px]">
      <Card
        ref={setNodeRef}
        className={`flex flex-col h-full ${
          isOver ? "ring-2 ring-blue-500 ring-offset-2" : ""
        }`}
      >
        <CardHeader className="pb-3 shrink-0 sticky top-0 bg-card z-10">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-semibold">{config.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={isOverLimit ? "destructive" : "secondary"}
                className="text-xs"
              >
                {cards.length}
                {wipLimit && ` / ${wipLimit}`}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-2 overflow-hidden">
          <ScrollArea className="h-full">
            <SortableContext
              items={cardIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {cards.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No work orders
                  </div>
                ) : (
                  cards.map((card) => (
                    <KanbanCard
                      key={card.id}
                      card={card}
                      compact={compact}
                      onView={onView}
                      onAssign={onAssign}
                      onAddNote={onAddNote}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

