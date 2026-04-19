import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

/**
 * Delete a banque entry by its composite ID.
 * - IDs starting with "pay-" are from the payments table
 * - Other IDs are manual caisse entries with paymentMethod=virement
 */
export function useDeleteBanqueEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (compositeId: string) => {
      if (compositeId.startsWith('pay-')) {
        const realId = compositeId.replace('pay-', '');
        return api.deletePayment(realId);
      }
      return api.deleteCaisseEntry(compositeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caisse'] });
      queryClient.invalidateQueries({ queryKey: ['banque'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useBanqueBalance() {
  return useQuery({
    queryKey: ['banque', 'balance'],
    queryFn: () => api.getBanqueBalance(),
  });
}

export function useSetBanqueBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (balance: number) => api.setBanqueBalance(balance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banque'] });
      queryClient.invalidateQueries({ queryKey: ['caisse'] });
    },
  });
}

export function usePurgeBanque() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.purgeBanque(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banque'] });
      queryClient.invalidateQueries({ queryKey: ['caisse'] });
    },
  });
}
