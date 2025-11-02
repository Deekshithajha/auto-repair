/**
 * Main Kanban board component
 */
import React, { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { useKanbanDnd } from "../hooks/useKanbanDnd";
import { useWorkOrdersQuery, useMoveWorkOrderMutation } from "../api/kanban.queries";
import { useRealtimeWorkorders } from "../hooks/useRealtimeWorkorders";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanToolbar } from "./KanbanToolbar";
import { KanbanSkeleton } from "./KanbanSkeleton";
import { EmptyState } from "./EmptyState";
import { KanbanCard } from "./KanbanCard";
import { announceToScreenReader } from "../utils/a11y";
import { getColumnOrder, getStatusLabel } from "../utils/status.config";
import type { KanbanFilters, WorkOrderCard, WorkOrderStatus } from "../types/kanban.types";

interface KanbanBoardProps {
  filters?: KanbanFilters;
  employees?: Array<{ id: string; name: string }>;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  filters: initialFilters,
  employees = [],
}) => {
  const [filters, setFilters] = useState<KanbanFilters>(initialFilters || {});
  const [compactMode, setCompactMode] = useState(false);
  const [draggedCard, setDraggedCard] = useState<WorkOrderCard | null>(null);

  // Query hooks
  const { data: cards = [], isLoading, error, refetch } = useWorkOrdersQuery(filters);
  const moveMutation = useMoveWorkOrderMutation();

  // Realtime subscription
  useRealtimeWorkorders(filters);

  // DnD hooks
  const {
    sensors,
    activeId,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useKanbanDnd();

  // Group cards by status
  const cardsByStatus = useMemo(() => {
    const grouped: Record<WorkOrderStatus, WorkOrderCard[]> = {
      pending: [],
      approved: [],
      declined: [],
      assigned: [],
      in_progress: [],
      ready_for_pickup: [],
      completed: [],
    };

    cards.forEach((card) => {
      if (grouped[card.status]) {
        grouped[card.status].push(card);
      }
    });

    return grouped;
  }, [cards]);

  const handleDragStartWithCard = (event: any) => {
    handleDragStart(event);
    const cardId = event.active.id as string;
    const card = cards.find((c) => `card-${c.id}` === cardId);
    setDraggedCard(card || null);
  };

  const handleDragEndWithMove = (event: any) => {
    handleDragEnd(event, (id: string, toStatus: WorkOrderStatus) => {
      const cardId = id.replace("card-", "");
      const card = cards.find((c) => c.id === cardId);
      
      if (card && card.status !== toStatus) {
        moveMutation.mutate({
          id: cardId,
          toStatus,
          fromStatus: card.status,
        });

        announceToScreenReader(
          `Moved ${card.ticket_id} to ${getStatusLabel(toStatus)}`
        );
      }
    });
    setDraggedCard(null);
  };

  const columnOrder = getColumnOrder();

  // Actions
  const handleView = (id: string) => {
    // TODO: Navigate to ticket detail or open modal
    console.log("View ticket", id);
  };

  const handleAssign = (id: string) => {
    // TODO: Open assign mechanic dialog
    console.log("Assign mechanic", id);
  };

  const handleAddNote = (id: string) => {
    // TODO: Open add note dialog
    console.log("Add note", id);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  if (isLoading) {
    return <KanbanSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold mb-2">Error loading work orders</h3>
        <p className="text-muted-foreground mb-4">{error.message || "Unknown error"}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true));
  const totalCards = cards.length;

  if (totalCards === 0) {
    return (
      <div className="space-y-4">
        <KanbanToolbar
          filters={filters}
          onFiltersChange={setFilters}
          onResetFilters={handleResetFilters}
          compactMode={compactMode}
          onCompactModeChange={setCompactMode}
          totalCards={totalCards}
          employees={employees}
        />
        <EmptyState
          hasFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <KanbanToolbar
        filters={filters}
        onFiltersChange={setFilters}
        onResetFilters={handleResetFilters}
        compactMode={compactMode}
        onCompactModeChange={setCompactMode}
        totalCards={totalCards}
        employees={employees}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStartWithCard}
        onDragEnd={handleDragEndWithMove}
        onDragCancel={handleDragCancel}
      >
        {/* Mobile: horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {columnOrder.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              cards={cardsByStatus[status] || []}
              compact={compactMode}
              onView={handleView}
              onAssign={handleAssign}
              onAddNote={handleAddNote}
            />
          ))}
        </div>

        <DragOverlay>
          {draggedCard ? (
            <div className="transform rotate-2 opacity-90">
              <KanbanCard card={draggedCard} compact={compactMode} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

