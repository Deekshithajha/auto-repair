/**
 * Realtime subscription hook for workorders
 */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { adapters } from "../api/kanban.adapters";
import type { WorkOrderCard, KanbanFilters } from "../types/kanban.types";

export function useRealtimeWorkorders(filters?: KanbanFilters) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = adapters.subscribeWorkOrders(
      (card: WorkOrderCard) => {
        // Update query cache optimistically
        queryClient.setQueriesData<WorkOrderCard[]>(
          { queryKey: ["kanban", "workorders"] },
          (old) => {
            if (!old) return old;

            const index = old.findIndex((c) => c.id === card.id);
            if (index >= 0) {
              // Update existing
              const updated = [...old];
              updated[index] = card;
              return updated;
            } else {
              // Add new
              return [...old, card];
            }
          }
        );

        // Optionally refetch to ensure consistency
        queryClient.invalidateQueries({
          queryKey: ["kanban", "workorders", filters],
          refetchType: "none", // Don't trigger refetch, just update cache
        });
      },
      (id: string) => {
        // Remove from cache
        queryClient.setQueriesData<WorkOrderCard[]>(
          { queryKey: ["kanban", "workorders"] },
          (old) => {
            if (!old) return old;
            return old.filter((c) => c.id !== id);
          }
        );

        queryClient.invalidateQueries({
          queryKey: ["kanban", "workorders", filters],
          refetchType: "none",
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [queryClient, filters]);
}

