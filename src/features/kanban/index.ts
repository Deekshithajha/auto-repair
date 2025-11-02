/**
 * Kanban feature module - main export
 */
export { KanbanBoard } from "./components/KanbanBoard";
export type {
  WorkOrderCard,
  WorkOrderStatus,
  KanbanFilters,
  Priority,
} from "./types/kanban.types";
export { getColumnOrder, getStatusConfig, getStatusLabel } from "./utils/status.config";

