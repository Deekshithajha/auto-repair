/**
 * Kanban TV Admin API
 * Operations for managing boards, columns, and users
 */
import { supabase } from '@/integrations/supabase/client';
import type { KanbanBoard, KanbanColumn, KanbanUser } from '../types/kanban-tv.types';

// Board Management
export const kanbanAdminApi = {
  // Boards
  async createBoard(params: { name: string; slug: string; created_by: string | null }) {
    const { data, error } = await (supabase as any)
      .from('kanban_boards')
      .insert([params])
      .select()
      .single();

    if (error) throw error;
    return data as KanbanBoard;
  },

  async updateBoard(id: string, params: { name?: string; slug?: string; is_active?: boolean }) {
    const { data, error } = await (supabase as any)
      .from('kanban_boards')
      .update(params)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as KanbanBoard;
  },

  async deleteBoard(id: string) {
    const { error } = await (supabase as any)
      .from('kanban_boards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Columns
  async createColumn(params: {
    board_id: string;
    name: string;
    position: number;
    color?: string;
    wip_limit?: number | null;
  }) {
    const { data, error } = await (supabase as any)
      .from('kanban_columns')
      .insert([params])
      .select()
      .single();

    if (error) throw error;
    return data as KanbanColumn;
  },

  async updateColumn(id: string, params: {
    name?: string;
    position?: number;
    color?: string;
    wip_limit?: number | null;
  }) {
    const { data, error } = await (supabase as any)
      .from('kanban_columns')
      .update(params)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as KanbanColumn;
  },

  async deleteColumn(id: string) {
    const { error } = await (supabase as any)
      .from('kanban_columns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async reorderColumns(columnUpdates: { id: string; position: number }[]) {
    const promises = columnUpdates.map(({ id, position }) =>
      (supabase as any)
        .from('kanban_columns')
        .update({ position: String(position) })
        .eq('id', id)
    );

    const results = await Promise.all(promises);
    const error = results.find(r => r.error);
    if (error?.error) throw error.error;
  },

  // Users
  async getUsers() {
    const { data, error } = await (supabase as any)
      .from('kanban_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as KanbanUser[];
  },

  async createUser(params: {
    email: string;
    password_hash: string;
    role: 'KANBAN_ADMIN' | 'KANBAN_EDITOR' | 'KANBAN_VIEWER';
  }) {
    const { data, error } = await (supabase as any)
      .from('kanban_users')
      .insert([params])
      .select()
      .single();

    if (error) throw error;
    return data as KanbanUser;
  },

  async updateUser(id: string, params: {
    email?: string;
    password_hash?: string;
    role?: 'KANBAN_ADMIN' | 'KANBAN_EDITOR' | 'KANBAN_VIEWER';
    is_active?: boolean;
  }) {
    const { data, error } = await (supabase as any)
      .from('kanban_users')
      .update(params)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as KanbanUser;
  },

  async deleteUser(id: string) {
    const { error } = await (supabase as any)
      .from('kanban_users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
