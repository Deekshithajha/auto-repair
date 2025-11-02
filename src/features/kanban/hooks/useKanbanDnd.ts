/**
 * Drag and drop logic for Kanban using @dnd-kit
 */
import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
  type DragStartEvent as DndDragStartEvent,
  type DragEndEvent as DndDragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import type { WorkOrderStatus } from "../types/kanban.types";

export function useKanbanDnd() {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sensors for mouse and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before activating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (
    event: DragEndEvent,
    onMoveCard?: (id: string, toStatus: WorkOrderStatus) => void
  ) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropping in a different column
    if (overId.startsWith("column-")) {
      const toStatus = overId.replace("column-", "") as WorkOrderStatus;
      if (onMoveCard) {
        onMoveCard(activeId, toStatus);
      }
    } else if (overId.startsWith("card-")) {
      // Dropped on another card - extract status from the card's parent column
      // This is handled by the column's drop handler
      return;
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return {
    sensors,
    activeId,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}

export { DndContext, DragOverlay, closestCorners };
export { SortableContext, verticalListSortingStrategy, arrayMove };

