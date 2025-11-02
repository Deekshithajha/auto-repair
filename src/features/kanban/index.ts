/**
 * Kanban feature module - main export
 */
export { KanbanBoard } from "./components/KanbanBoard";
export { TicketDetailDialog } from "./components/TicketDetailDialog";
export { AssignMechanicDialog } from "./components/AssignMechanicDialog";
export { AddNoteDialog } from "./components/AddNoteDialog";
export type {
  WorkOrderCard,
  WorkOrderStatus,
  KanbanFilters,
  Priority,
} from "./types/kanban.types";
export { getColumnOrder, getStatusConfig, getStatusLabel } from "./utils/status.config";

