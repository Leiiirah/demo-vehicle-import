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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caisse'] });
    },
  });
}
