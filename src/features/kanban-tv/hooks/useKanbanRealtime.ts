/**
 * Kanban TV Realtime Hook
 * Manages realtime subscriptions with polling fallback
 */
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { kanbanTVApi } from '../api/kanban-tv.api';
import type { KanbanCard, KanbanColumn } from '../types/kanban-tv.types';

export function useKanbanRealtime(boardId: string, enabled: boolean = true) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (!enabled || !boardId) return;

    let pollingInterval: NodeJS.Timeout;
    let connectionCheckInterval: NodeJS.Timeout;
    let lastSocketActivity = Date.now();

    // Subscribe to realtime updates
    const unsubscribeCards = kanbanTVApi.subscribeToCards(
      boardId,
      (card: KanbanCard) => {
        lastSocketActivity = Date.now();
        setIsConnected(true);
        setLastUpdate(new Date());

        // Update query cache optimistically
        queryClient.setQueryData<KanbanCard[]>(
          ['kanban-tv', 'cards', boardId],
          (old) => {
            if (!old) return old;
            const index = old.findIndex((c) => c.id === card.id);
            if (index >= 0) {
              const updated = [...old];
              updated[index] = card;
              return updated;
            } else {
              return [...old, card];
            }
          }
        );
      },
      (cardId: string) => {
        lastSocketActivity = Date.now();
        setIsConnected(true);
        setLastUpdate(new Date());

        // Remove from cache
        queryClient.setQueryData<KanbanCard[]>(
          ['kanban-tv', 'cards', boardId],
          (old) => {
            if (!old) return old;
            return old.filter((c) => c.id !== cardId);
          }
        );
      }
    );

    const unsubscribeColumns = kanbanTVApi.subscribeToColumns(
      boardId,
      (column: KanbanColumn) => {
        lastSocketActivity = Date.now();
        setIsConnected(true);

        queryClient.setQueryData<KanbanColumn[]>(
          ['kanban-tv', 'columns', boardId],
          (old) => {
            if (!old) return old;
            const index = old.findIndex((c) => c.id === column.id);
            if (index >= 0) {
              const updated = [...old];
              updated[index] = column;
              return updated;
            } else {
              return [...old, column];
            }
          }
        );
      }
    );

    // Check if socket is active every 10 seconds
    connectionCheckInterval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastSocketActivity;
      if (timeSinceLastActivity > 10000) {
        setIsConnected(false);
      }
    }, 10000);

    // Polling fallback - refetch every 15 seconds if disconnected
    pollingInterval = setInterval(() => {
      if (!isConnected) {
        queryClient.invalidateQueries({
          queryKey: ['kanban-tv', 'cards', boardId],
        });
        queryClient.invalidateQueries({
          queryKey: ['kanban-tv', 'columns', boardId],
        });
      }
    }, 15000);

    return () => {
      unsubscribeCards();
      unsubscribeColumns();
      clearInterval(pollingInterval);
      clearInterval(connectionCheckInterval);
    };
  }, [boardId, enabled, isConnected, queryClient]);

  return {
    isConnected,
    lastUpdate,
  };
}
