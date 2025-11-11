/**
 * Kanban TV React Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanTVApi } from '../api/kanban-tv.api';
import type {
  MoveCardParams,
  CreateCardParams,
  UpdateCardParams,
} from '../types/kanban-tv.types';
import { toast } from '@/hooks/use-toast';

export function useKanbanBoard(slug: string) {
  return useQuery({
    queryKey: ['kanban-tv', 'board', slug],
    queryFn: () => kanbanTVApi.getBoardBySlug(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useKanbanColumns(boardId: string | undefined) {
  return useQuery({
    queryKey: ['kanban-tv', 'columns', boardId],
    queryFn: () => kanbanTVApi.getColumnsByBoard(boardId!),
    enabled: !!boardId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useKanbanCards(boardId: string | undefined) {
  return useQuery({
    queryKey: ['kanban-tv', 'cards', boardId],
    queryFn: () => kanbanTVApi.getCardsByBoard(boardId!),
    enabled: !!boardId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useMoveCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MoveCardParams) => kanbanTVApi.moveCard(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['kanban-tv', 'cards'],
      });
      toast({
        title: 'Card moved',
        description: 'Card position updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to move card',
        variant: 'destructive',
      });
    },
  });
}

export function useCreateCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateCardParams) => kanbanTVApi.createCard(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['kanban-tv', 'cards'],
      });
      toast({
        title: 'Card created',
        description: 'New card added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create card',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateCardParams) => kanbanTVApi.updateCard(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['kanban-tv', 'cards'],
      });
      toast({
        title: 'Card updated',
        description: 'Card details updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update card',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) => kanbanTVApi.deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['kanban-tv', 'cards'],
      });
      toast({
        title: 'Card deleted',
        description: 'Card removed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete card',
        variant: 'destructive',
      });
    },
  });
}
