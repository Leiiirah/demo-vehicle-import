import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type CreateUserData, type CreateSupplierData, type CreateDossierData, type CreateConteneurData, type CreateVehicleData, type CreateClientData, type CreatePasseportData, type CreatePaymentData, type CreateVehiclePaymentData, type CreateVehicleChargeData } from '@/services/api';

// Auth hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.getMe(),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// Users hooks
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => api.getUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserData) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateUserData> }) =>
      api.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Suppliers hooks
export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.getSuppliers(),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => api.getSupplier(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplierData) => api.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSupplierData> }) =>
      api.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

// Dossiers hooks
export function useDossiers() {
  return useQuery({
    queryKey: ['dossiers'],
    queryFn: () => api.getDossiers(),
  });
}

export function useDossier(id: string) {
  return useQuery({
    queryKey: ['dossiers', id],
    queryFn: () => api.getDossier(id),
    enabled: !!id,
  });
}

export function useCreateDossier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDossierData) => api.createDossier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
    },
  });
}

export function useUpdateDossier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDossierData> }) =>
      api.updateDossier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
    },
  });
}

export function useDeleteDossier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteDossier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
    },
  });
}

// Conteneurs hooks
export function useConteneurs() {
  return useQuery({
    queryKey: ['conteneurs'],
    queryFn: () => api.getConteneurs(),
  });
}

export function useConteneur(id: string) {
  return useQuery({
    queryKey: ['conteneurs', id],
    queryFn: () => api.getConteneur(id),
    enabled: !!id,
  });
}

export function useCreateConteneur() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateConteneurData) => api.createConteneur(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conteneurs'] });
    },
  });
}

export function useUpdateConteneur() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateConteneurData> }) =>
      api.updateConteneur(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conteneurs'] });
    },
  });
}

export function useDeleteConteneur() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteConteneur(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conteneurs'] });
    },
  });
}

// Vehicles hooks
export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.getVehicles(),
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => api.getVehicle(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVehicleData) => api.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['conteneurs'] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVehicleData> }) =>
      api.updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['conteneurs'] });
    },
  });
}

// Vehicle Payments hooks
export function useVehiclePayments(vehicleId: string) {
  return useQuery({
    queryKey: ['vehiclePayments', vehicleId],
    queryFn: () => api.getVehiclePayments(vehicleId),
    enabled: !!vehicleId,
  });
}

export function useCreateVehiclePayment(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVehiclePaymentData) => api.createVehiclePayment(vehicleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiclePayments', vehicleId] });
    },
  });
}

export function useUpdateVehiclePayment(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVehiclePaymentData> }) =>
      api.updateVehiclePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiclePayments', vehicleId] });
    },
  });
}

export function useDeleteVehiclePayment(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteVehiclePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiclePayments', vehicleId] });
    },
  });
}

// Vehicle Charges hooks
export function useVehicleCharges(vehicleId: string) {
  return useQuery({
    queryKey: ['vehicleCharges', vehicleId],
    queryFn: () => api.getVehicleCharges(vehicleId),
    enabled: !!vehicleId,
  });
}

export function useCreateVehicleCharge(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVehicleChargeData) => api.createVehicleCharge(vehicleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleCharges', vehicleId] });
    },
  });
}

export function useUpdateVehicleCharge(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVehicleChargeData> }) =>
      api.updateVehicleCharge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleCharges', vehicleId] });
    },
  });
}

export function useDeleteVehicleCharge(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteVehicleCharge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleCharges', vehicleId] });
    },
  });
}

// Clients hooks
export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => api.getClients(),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => api.getClient(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientData) => api.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientData> }) =>
      api.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// Passeports hooks
export function usePasseports() {
  return useQuery({
    queryKey: ['passeports'],
    queryFn: () => api.getPasseports(),
  });
}

export function usePasseport(id: string) {
  return useQuery({
    queryKey: ['passeports', id],
    queryFn: () => api.getPasseport(id),
    enabled: !!id,
  });
}

export function useCreatePasseport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePasseportData) => api.createPasseport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passeports'] });
    },
  });
}

export function useUpdatePasseport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePasseportData> }) =>
      api.updatePasseport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passeports'] });
    },
  });
}

export function useDeletePasseport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deletePasseport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passeports'] });
    },
  });
}

// Payments hooks
export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: () => api.getPayments(),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => api.getPayment(id),
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentData) => api.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePaymentData> }) =>
      api.updatePayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

// Dashboard hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.getDashboardStats(),
  });
}

export function useProfitHistory() {
  return useQuery({
    queryKey: ['dashboard', 'profitHistory'],
    queryFn: () => api.getProfitHistory(),
  });
}

export function useVehiclesByStatus() {
  return useQuery({
    queryKey: ['dashboard', 'vehiclesByStatus'],
    queryFn: () => api.getVehiclesByStatus(),
  });
}

export function useTopVehicles() {
  return useQuery({
    queryKey: ['dashboard', 'topVehicles'],
    queryFn: () => api.getTopVehicles(),
  });
}
