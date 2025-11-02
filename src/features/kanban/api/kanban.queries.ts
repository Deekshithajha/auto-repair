/**
 * TanStack Query hooks for Kanban
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adapters } from "./kanban.adapters";
import type {
  WorkOrderCard,
  KanbanFilters,
  MoveWorkOrderParams,
} from "../types/kanban.types";
import { useToast } from "@/hooks/use-toast";

const QUERY_KEYS = {
  workOrders: (filters?: KanbanFilters) =>
    ["kanban", "workorders", filters] as const,
};

export function useWorkOrdersQuery(filters?: KanbanFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.workOrders(filters),
    queryFn: () => adapters.getWorkOrders(filters),
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useMoveWorkOrderMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: MoveWorkOrderParams) => {
      return adapters.moveWorkOrder(params);
    },
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["kanban", "workorders"],
      });

      // Snapshot previous value
      const previousCards = queryClient.getQueriesData<WorkOrderCard[]>({
        queryKey: ["kanban", "workorders"],
      });

      // Optimistically update
      queryClient.setQueriesData<WorkOrderCard[]>(
        { queryKey: ["kanban", "workorders"] },
        (old) => {
          if (!old) return old;
          return old.map((card) =>
            card.id === params.id
              ? {
                  ...card,
                  status: params.toStatus,
                  updated_at: new Date().toISOString(),
                  time_in_status_seconds: 0,
                }
              : card
          );
        }
      );

      return { previousCards };
    },
    onError: (error, params, context) => {
      // Rollback on error
      if (context?.previousCards) {
        context.previousCards.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      toast({
        title: "Error",
        description: error.message || "Failed to move work order",
        variant: "destructive",
      });
    },
    onSuccess: (data, params) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["kanban", "workorders"],
      });

      toast({
        title: "Success",
        description: `Work order moved to ${data.status}`,
      });
    },
  });
}

export function usePatchWorkOrderMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      partial,
    }: {
      id: string;
      partial: Partial<WorkOrderCard>;
    }) => {
      return adapters.patchWorkOrder(id, partial);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kanban", "workorders"],
      });

      toast({
        title: "Success",
        description: "Work order updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update work order",
        variant: "destructive",
      });
    },
  });
}

