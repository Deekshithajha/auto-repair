/**
 * Kanban board types
 * Aligned with existing ticket_status enum from Supabase
 */

export type WorkOrderStatus =
  | "pending"
  | "approved"
  | "declined"
  | "assigned"
  | "in_progress"
  | "ready_for_pickup"
  | "completed";

export type Priority = "low" | "normal" | "high" | "urgent";

export interface WorkOrderCard {
  id: string;
  ticket_id: string;
  vehicle_plate?: string | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_year?: number | null;
  priority?: Priority | null;
  assigned_mechanic_id?: string | null;
  assigned_mechanic_name?: string | null;
  status: WorkOrderStatus;
  created_at: string;
  updated_at: string;
  started_at?: string | null;
  est_complete_at?: string | null;
  time_in_status_seconds?: number;
  notes_count?: number;
  attachments_count?: number;
  description?: string | null;
}

export interface KanbanColumnConfig {
  key: WorkOrderStatus;
  title: string;
  wipLimit?: number;
  color?: string;
}

export interface KanbanFilters {
  mechanic_id?: string | null;
  priority?: Priority[] | null;
  vehicle_make?: string | null;
  search?: string | null;
  date_from?: string | null;
  date_to?: string | null;
}

export interface MoveWorkOrderParams {
  id: string;
  toStatus: WorkOrderStatus;
  fromStatus?: WorkOrderStatus;
}

