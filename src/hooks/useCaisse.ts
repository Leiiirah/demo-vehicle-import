import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type CreateCaisseEntryData } from '@/services/api';

export function useCaisseEntries() {
  return useQuery({
    queryKey: ['caisse'],
    queryFn: () => api.getCaisseEntries(),
  });
}

export function useCaisseSummary() {
  return useQuery({
    queryKey: ['caisse', 'summary'],
    queryFn: () => api.getCaisseSummary(),
  });
}

export function useCaisseBalance() {
  return useQuery({
    queryKey: ['caisse', 'balance'],
    queryFn: () => api.getCaisseBalance(),
  });
}

export function useSetCaisseBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (balance: number) => api.setCaisseBalance(balance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caisse'] });
    },
  });
}

export function useCreateCaisseEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCaisseEntryData) => api.createCaisseEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caisse'] });
    },
  });
}

export function useUpdateCaisseEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCaisseEntryData> }) =>
      api.updateCaisseEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caisse'] });
    },
  });
}

export function useDeleteCaisseEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCaisseEntry(id),
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: ['caisse'] });
      const previous = queryClient.getQueryData(['caisse']);
      queryClient.setQueryData(['caisse'], (old: any[] | undefined) =>
        old ? old.filter((e: any) => e.id !== deletedId) : []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['caisse'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['caisse'] });
    },
  });
}
