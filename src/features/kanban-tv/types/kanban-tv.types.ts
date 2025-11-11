/**
 * Kanban TV System Types
 * Separate type system for the TV display kanban
 */

export type KanbanUserRole = 'KANBAN_ADMIN' | 'KANBAN_EDITOR' | 'KANBAN_VIEWER';
export type KanbanPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface KanbanUser {
  id: string;
  email: string;
  role: KanbanUserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KanbanBoard {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface KanbanColumn {
  id: string;
  board_id: string;
  name: string;
  position: number;
  wip_limit: number | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface KanbanCard {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  ticket_id: string | null;
  priority: KanbanPriority;
  assignee: string | null;
  eta: string | null;
  tags: string[];
  position: number;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface KanbanActivity {
  id: string;
  card_id: string;
  actor_id: string | null;
  action: 'CREATED' | 'MOVED' | 'UPDATED' | 'COMMENTED' | 'BLOCKED' | 'UNBLOCKED';
  from_column_id: string | null;
  to_column_id: string | null;
  diff: Record<string, any> | null;
  created_at: string;
}

export interface MoveCardParams {
  cardId: string;
  toColumnId: string;
  toPosition: number;
}

export interface CreateCardParams {
  board_id: string;
  column_id: string;
  title: string;
  description?: string;
  priority?: KanbanPriority;
  assignee?: string;
  eta?: string;
  tags?: string[];
  position: number;
}

export interface UpdateCardParams {
  id: string;
  title?: string;
  description?: string;
  priority?: KanbanPriority;
  assignee?: string;
  eta?: string;
  tags?: string[];
  is_blocked?: boolean;
}

export interface TVDisplaySettings {
  autoPanSpeed: number; // milliseconds between column switches
  refreshInterval: number; // polling fallback interval
  compactMode: boolean;
  showSLAColors: boolean;
}
