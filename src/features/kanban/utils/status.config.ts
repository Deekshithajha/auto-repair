/**
 * Status configuration - single source of truth for Kanban columns
 */
import type { KanbanColumnConfig, WorkOrderStatus } from "../types/kanban.types";

export const STATUS_COLUMN_ORDER: WorkOrderStatus[] = [
  "pending",
  "approved",
  "assigned",
  "in_progress",
  "ready_for_pickup",
  "completed",
  "declined",
];

export const STATUS_CONFIG: Record<WorkOrderStatus, KanbanColumnConfig> = {
  pending: {
    key: "pending",
    title: "Pending",
    wipLimit: undefined,
    color: "slate",
  },
  approved: {
    key: "approved",
    title: "Approved",
    wipLimit: undefined,
    color: "blue",
  },
  declined: {
    key: "declined",
    title: "Declined",
    wipLimit: undefined,
    color: "red",
  },
  assigned: {
    key: "assigned",
    title: "Assigned",
    wipLimit: undefined,
    color: "purple",
  },
  in_progress: {
    key: "in_progress",
    title: "In Progress",
    wipLimit: 10,
    color: "amber",
  },
  ready_for_pickup: {
    key: "ready_for_pickup",
    title: "Ready for Pickup",
    wipLimit: undefined,
    color: "green",
  },
  completed: {
    key: "completed",
    title: "Completed",
    wipLimit: undefined,
    color: "gray",
  },
};

export function getStatusConfig(status: WorkOrderStatus): KanbanColumnConfig {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
}

export function getColumnOrder(): WorkOrderStatus[] {
  return STATUS_COLUMN_ORDER;
}

export function getStatusLabel(status: WorkOrderStatus): string {
  return STATUS_CONFIG[status]?.title || status;
}

