/**
 * Kanban TV API Layer
 * Handles all database operations for the Kanban TV system
 */
import { supabase } from '@/integrations/supabase/client';
import type {
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  KanbanActivity,
  MoveCardParams,
  CreateCardParams,
  UpdateCardParams,
} from '../types/kanban-tv.types';

export const kanbanTVApi = {
  // ========== BOARDS ==========
  async getBoards() {
    const { data, error } = await supabase
      .from('kanban_boards')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as KanbanBoard[];
  },

  async getBoardBySlug(slug: string) {
    const { data, error } = await supabase
      .from('kanban_boards')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data as KanbanBoard;
  },

  // ========== COLUMNS ==========
  async getColumnsByBoard(boardId: string) {
    const { data, error } = await supabase
      .from('kanban_columns')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data as KanbanColumn[];
  },

  // ========== CARDS ==========
  async getCardsByBoard(boardId: string) {
    const { data, error } = await supabase
      .from('kanban_cards')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data as KanbanCard[];
  },

  async getCardsByColumn(columnId: string) {
    const { data, error } = await supabase
      .from('kanban_cards')
      .select('*')
      .eq('column_id', columnId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data as KanbanCard[];
  },

  async createCard(params: CreateCardParams) {
    const { data, error } = await supabase
      .from('kanban_cards')
      .insert({
        ...params,
        is_blocked: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as KanbanCard;
  },

  async updateCard(params: UpdateCardParams) {
    const { id, ...updates } = params;
    const { data, error } = await supabase
      .from('kanban_cards')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as KanbanCard;
  },

  async moveCard(params: MoveCardParams) {
    const { cardId, toColumnId, toPosition } = params;

    // Get current card state for activity log
    const { data: oldCard } = await supabase
      .from('kanban_cards')
      .select('*')
      .eq('id', cardId)
      .single();

    // Update card position and column
    const { data, error } = await supabase
      .from('kanban_cards')
      .update({
        column_id: toColumnId,
        position: toPosition,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cardId)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    if (oldCard && oldCard.column_id !== toColumnId) {
      await supabase.from('kanban_activity').insert({
        card_id: cardId,
        action: 'MOVED',
        from_column_id: oldCard.column_id,
        to_column_id: toColumnId,
        diff: { old_position: oldCard.position, new_position: toPosition },
      });
    }

    return data as KanbanCard;
  },

  async deleteCard(cardId: string) {
    const { error } = await supabase
      .from('kanban_cards')
      .delete()
      .eq('id', cardId);

    if (error) throw error;
  },

  // ========== ACTIVITY ==========
  async getCardActivity(cardId: string) {
    const { data, error } = await supabase
      .from('kanban_activity')
      .select('*')
      .eq('card_id', cardId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as KanbanActivity[];
  },

  // ========== REALTIME SUBSCRIPTION ==========
  subscribeToCards(
    boardId: string,
    onUpdate: (payload: any) => void,
    onDelete: (id: string) => void
  ) {
    const channel = supabase
      .channel(`kanban_cards:${boardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kanban_cards',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            onDelete(payload.old.id);
          } else {
            onUpdate(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToColumns(
    boardId: string,
    onUpdate: (payload: any) => void
  ) {
    const channel = supabase
      .channel(`kanban_columns:${boardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kanban_columns',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
