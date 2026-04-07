const API_URL = import.meta.env.VITE_API_URL || 'https://api.vhlimport.com';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const token = this.getToken();
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      
      if (response.status === 401) {
        this.removeToken();
        window.location.href = '/login';
      }
      
      throw new Error(error.message || `HTTP error ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ accessToken: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    this.setToken(data.accessToken);
    return data;
  }

  async logout() {
    await this.request('/api/auth/logout', { method: 'POST' });
    this.removeToken();
  }

  async getMe() {
    return this.request<User>('/api/auth/me');
  }

  // Users
  async getUsers() {
    return this.request<User[]>('/api/users');
  }

  async getUser(id: string) {
    return this.request<User>(`/api/users/${id}`);
  }

  async createUser(data: CreateUserData) {
    return this.request<User>('/api/users', { method: 'POST', body: data });
  }

  async updateUser(id: string, data: Partial<CreateUserData>) {
    return this.request<User>(`/api/users/${id}`, { method: 'PATCH', body: data });
  }

  async deleteUser(id: string) {
    return this.request(`/api/users/${id}`, { method: 'DELETE' });
  }

  // Suppliers
  async getSuppliers() {
    return this.request<Supplier[]>('/api/suppliers');
  }

  async getSupplier(id: string) {
    return this.request<Supplier>(`/api/suppliers/${id}`);
  }

  async createSupplier(data: CreateSupplierData) {
    return this.request<Supplier>('/api/suppliers', { method: 'POST', body: data });
  }

  async updateSupplier(id: string, data: Partial<CreateSupplierData>) {
    return this.request<Supplier>(`/api/suppliers/${id}`, { method: 'PATCH', body: data });
  }

  async deleteSupplier(id: string) {
    return this.request(`/api/suppliers/${id}`, { method: 'DELETE' });
  }

  // Dossiers
  async getDossiers() {
    return this.request<Dossier[]>('/api/dossiers');
  }

  async getDossier(id: string) {
    return this.request<Dossier>(`/api/dossiers/${id}`);
  }

  async createDossier(data: CreateDossierData) {
    return this.request<Dossier>('/api/dossiers', { method: 'POST', body: data });
  }

  async updateDossier(id: string, data: Partial<CreateDossierData>) {
    return this.request<Dossier>(`/api/dossiers/${id}`, { method: 'PATCH', body: data });
  }

  async deleteDossier(id: string) {
    return this.request(`/api/dossiers/${id}`, { method: 'DELETE' });
  }

  // Conteneurs
  async getConteneurs() {
    return this.request<Conteneur[]>('/api/conteneurs');
  }

  async getConteneur(id: string) {
    return this.request<Conteneur>(`/api/conteneurs/${id}`);
  }

  async createConteneur(data: CreateConteneurData) {
    return this.request<Conteneur>('/api/conteneurs', { method: 'POST', body: data });
  }

  async updateConteneur(id: string, data: Partial<CreateConteneurData>) {
    return this.request<Conteneur>(`/api/conteneurs/${id}`, { method: 'PATCH', body: data });
  }

  async deleteConteneur(id: string) {
    return this.request(`/api/conteneurs/${id}`, { method: 'DELETE' });
  }

  // Vehicles
  async getVehicles() {
    return this.request<Vehicle[]>('/api/vehicles');
  }

  async getVehicle(id: string) {
    return this.request<Vehicle>(`/api/vehicles/${id}`);
  }

  async createVehicle(data: CreateVehicleData) {
    return this.request<Vehicle>('/api/vehicles', { method: 'POST', body: data });
  }

  async updateVehicle(id: string, data: Partial<CreateVehicleData>) {
    return this.request<Vehicle>(`/api/vehicles/${id}`, { method: 'PATCH', body: data });
  }

  async deleteVehicle(id: string) {
    return this.request(`/api/vehicles/${id}`, { method: 'DELETE' });
  }

  // Vehicle Payments
  async getVehiclePayments(vehicleId: string) {
    return this.request<VehiclePayment[]>(`/api/vehicles/${vehicleId}/payments`);
  }

  async createVehiclePayment(vehicleId: string, data: CreateVehiclePaymentData) {
    return this.request<VehiclePayment>(`/api/vehicles/${vehicleId}/payments`, {
      method: 'POST',
      body: data,
    });
  }

  async updateVehiclePayment(id: string, data: Partial<CreateVehiclePaymentData>) {
    return this.request<VehiclePayment>(`/api/vehicles/payments/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteVehiclePayment(id: string) {
    return this.request(`/api/vehicles/payments/${id}`, { method: 'DELETE' });
  }

  // Vehicle Charges
  async getVehicleCharges(vehicleId: string) {
    return this.request<VehicleCharge[]>(`/api/vehicles/${vehicleId}/charges`);
  }

  async createVehicleCharge(vehicleId: string, data: CreateVehicleChargeData) {
    return this.request<VehicleCharge>(`/api/vehicles/${vehicleId}/charges`, {
      method: 'POST',
      body: data,
    });
  }

  async updateVehicleCharge(id: string, data: Partial<CreateVehicleChargeData>) {
    return this.request<VehicleCharge>(`/api/vehicles/charges/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteVehicleCharge(id: string) {
    return this.request(`/api/vehicles/charges/${id}`, { method: 'DELETE' });
  }

  // Clients
  async getClients() {
    return this.request<Client[]>('/api/clients');
  }

  async getClient(id: string) {
    return this.request<Client>(`/api/clients/${id}`);
  }

  async createClient(data: CreateClientData) {
    return this.request<Client>('/api/clients', { method: 'POST', body: data });
  }

  async updateClient(id: string, data: Partial<CreateClientData>) {
    return this.request<Client>(`/api/clients/${id}`, { method: 'PATCH', body: data });
  }

  async deleteClient(id: string) {
    return this.request(`/api/clients/${id}`, { method: 'DELETE' });
  }

  // Passeports
  async getPasseports() {
    return this.request<Passeport[]>('/api/passeports');
  }

  async getPasseport(id: string) {
    return this.request<Passeport>(`/api/passeports/${id}`);
  }

  async createPasseport(data: CreatePasseportData) {
    return this.request<Passeport>('/api/passeports', { method: 'POST', body: data });
  }

  async updatePasseport(id: string, data: Partial<CreatePasseportData>) {
    return this.request<Passeport>(`/api/passeports/${id}`, { method: 'PATCH', body: data });
  }

  async deletePasseport(id: string) {
    return this.request(`/api/passeports/${id}`, { method: 'DELETE' });
  }

  // Payments
  async getPayments() {
    return this.request<Payment[]>('/api/payments');
  }

  async getPayment(id: string) {
    return this.request<Payment>(`/api/payments/${id}`);
  }

  async createPayment(data: CreatePaymentData) {
    return this.request<Payment>('/api/payments', { method: 'POST', body: data });
  }

  async updatePayment(id: string, data: Partial<CreatePaymentData>) {
    return this.request<Payment>(`/api/payments/${id}`, { method: 'PATCH', body: data });
  }

  async deletePayment(id: string) {
    return this.request(`/api/payments/${id}`, { method: 'DELETE' });
  }

  // Caisse
  async getCaisseEntries() {
    return this.request<CaisseEntry[]>('/api/caisse');
  }

  async getCaisseEntry(id: string) {
    return this.request<CaisseEntry>(`/api/caisse/${id}`);
  }

  async getCaisseSummary() {
    return this.request<CaisseSummary>('/api/caisse/summary');
  }

  async getCaisseBalance() {
    return this.request<CaisseBalanceData>('/api/caisse/balance');
  }

  async setCaisseBalance(balance: number) {
    return this.request<CaisseBalanceData>('/api/caisse/balance', {
      method: 'PUT',
      body: { balance },
    });
  }

  async createCaisseEntry(data: CreateCaisseEntryData) {
    return this.request<CaisseEntry>('/api/caisse', { method: 'POST', body: data });
  }

  async updateCaisseEntry(id: string, data: Partial<CreateCaisseEntryData>) {
    return this.request<CaisseEntry>(`/api/caisse/${id}`, { method: 'PATCH', body: data });
  }

  async deleteCaisseEntry(id: string) {
    return this.request(`/api/caisse/${id}`, { method: 'DELETE' });
  }

  async purgeCaisse() {
    return this.request<{ deleted: number }>('/api/caisse/purge/all', { method: 'DELETE' });
  }

  // Car Models
  async getCarModels(brand?: string) {
    const query = brand ? `?brand=${encodeURIComponent(brand)}` : '';
    return this.request<CarModel[]>(`/api/car-models${query}`);
  }

  async getCarModel(id: string) {
    return this.request<CarModel>(`/api/car-models/${id}`);
  }

  async createCarModel(data: CreateCarModelData) {
    return this.request<CarModel>('/api/car-models', { method: 'POST', body: data });
  }

  async updateCarModel(id: string, data: Partial<CreateCarModelData>) {
    return this.request<CarModel>(`/api/car-models/${id}`, { method: 'PATCH', body: data });
  }

  async deleteCarModel(id: string) {
    return this.request(`/api/car-models/${id}`, { method: 'DELETE' });
  }

  // Dashboard
  async getDashboardStats(params?: { month?: number; year?: number }) {
    const query = this.buildDateQuery(params);
    return this.request<DashboardStats>(`/api/dashboard/stats${query}`);
  }

  async getProfitHistory(params?: { year?: number }) {
    const query = params?.year ? `?year=${params.year}` : '';
    return this.request<ProfitHistory[]>(`/api/dashboard/profit-history${query}`);
  }

  async getVehiclesByStatus(params?: { month?: number; year?: number }) {
    const query = this.buildDateQuery(params);
    return this.request<VehiclesByStatus[]>(`/api/dashboard/vehicles-by-status${query}`);
  }

  async getTopVehicles(params?: { month?: number; year?: number }) {
    const query = this.buildDateQuery(params);
    return this.request<TopVehicle[]>(`/api/dashboard/top-vehicles${query}`);
  }

  private buildDateQuery(params?: { month?: number; year?: number }): string {
    if (!params) return '';
    const parts: string[] = [];
    if (params.month) parts.push(`month=${params.month}`);
    if (params.year) parts.push(`year=${params.year}`);
    return parts.length > 0 ? `?${parts.join('&')}` : '';
  }

  // Zakat
  async getZakatRecords() {
    return this.request<ZakatRecord[]>('/api/zakat');
  }

  async createZakatRecord(data: CreateZakatRecordData) {
    return this.request<ZakatRecord>('/api/zakat', { method: 'POST', body: data });
  }

  async updateZakatRecord(id: string, data: UpdateZakatRecordData) {
    return this.request<ZakatRecord>(`/api/zakat/${id}`, { method: 'PATCH', body: data });
  }

  async deleteZakatRecord(id: string) {
    return this.request<void>(`/api/zakat/${id}`, { method: 'DELETE' });
  }

  // Sales
  async getSales() {
    return this.request<Sale[]>('/api/sales');
  }

  async getSalesByClient(clientId: string) {
    return this.request<Sale[]>(`/api/sales/client/${clientId}`);
  }

  async getSale(id: string) {
    return this.request<Sale>(`/api/sales/${id}`);
  }

  async createSale(data: CreateSaleData) {
    return this.request<Sale>('/api/sales', { method: 'POST', body: data });
  }

  async addSalePayment(saleId: string, amount: number) {
    return this.request<Sale>(`/api/sales/${saleId}/payment`, { method: 'POST', body: { amount } });
  }

  async deleteSale(id: string) {
    return this.request(`/api/sales/${id}`, { method: 'DELETE' });
  }
}

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  lastActive?: string;
  createdAt?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'user';
  status?: 'active' | 'inactive';
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  creditBalance: number;
  totalPaid: number;
  remainingDebt: number;
  vehiclesSupplied: number;
  rating: number;
  dossiers?: Dossier[];
}

export interface CreateSupplierData {
  name: string;
  location: string;
  creditBalance?: number;
  totalPaid?: number;
  remainingDebt?: number;
  vehiclesSupplied?: number;
  rating?: number;
}

export interface Dossier {
  id: string;
  reference: string;
  supplierId: string;
  supplier?: Supplier;
  dateCreation: string;
  status: 'en_cours' | 'solde' | 'annule';
  conteneurs?: Conteneur[];
}

export interface CreateDossierData {
  reference: string;
  supplierId: string;
  dateCreation: string;
  status?: 'en_cours' | 'solde' | 'annule';
}

export interface Conteneur {
  id: string;
  numero: string;
  dossierId: string;
  dossier?: Dossier;
  type: '20ft' | '40ft' | '40ft_hc';
  status: 'charge' | 'arrivee' | 'decharge';
  coutTransport: number;
  dateDepart?: string;
  dateArrivee?: string;
  vehicles?: Vehicle[];
}

export interface CreateConteneurData {
  numero: string;
  dossierId: string;
  type?: '20ft' | '40ft' | '40ft_hc';
  status?: 'charge' | 'arrivee' | 'decharge';
  coutTransport?: number;
  dateDepart?: string;
  dateArrivee?: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  clientId?: string;
  client?: Client;
  supplierId: string;
  supplier?: Supplier;
  conteneurId: string;
  conteneur?: Conteneur;
  passeportId?: string;
  passeport?: Passeport;
  saleId?: string;
  sale?: Sale;
  status: 'ordered' | 'in_transit' | 'arrived' | 'sold';
  purchasePrice: number;
  transportCost: number;
  theoreticalRate?: number;
  passeportCost?: number;
  localFees: number;
  totalCost: number;
  sellingPrice?: number;
  photoUrl?: string;
  color?: string;
  transmission?: 'manual' | 'automatic';
  paymentStatus?: 'versement' | 'solde' | null;
  amountPaid?: number;
  orderDate: string;
  arrivalDate?: string;
  soldDate?: string;
}

export interface CreateVehicleData {
  brand: string;
  model: string;
  year: number;
  vin: string;
  clientId?: string;
  supplierId: string;
  conteneurId: string;
  passeportId?: string;
  status?: 'ordered' | 'in_transit' | 'arrived' | 'sold' | 'vendu_bare';
  purchasePrice: number;
  theoreticalRate?: number;
  passeportCost?: number;
  localFees?: number;
  totalCost?: number;
  sellingPrice?: number;
  color?: string;
  transmission?: string;
  photoUrl?: string;
  paymentStatus?: 'versement' | 'solde' | null;
  amountPaid?: number;
  orderDate: string;
  arrivalDate?: string;
  soldDate?: string;
}

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse?: string;
  email?: string;
  company?: string;
  pourcentageBenefice: number;
  prixVente: number;
  coutRevient: number;
  detteBenefice: number;
  paye: boolean;
  vehicles?: Vehicle[];
}

export interface CreateClientData {
  nom: string;
  prenom: string;
  telephone: string;
  adresse?: string;
  email?: string;
  company?: string;
  pourcentageBenefice?: number;
  prixVente?: number;
  coutRevient?: number;
  detteBenefice?: number;
  paye?: boolean;
}

export interface Passeport {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse?: string;
  numeroPasseport: string;
  nin?: string;
  pdfPasseport?: string;
  montantDu: number;
  paye: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePasseportData {
  nom: string;
  prenom: string;
  telephone: string;
  adresse?: string;
  numeroPasseport: string;
  nin?: string;
  pdfPasseport?: string;
  montantDu?: number;
  paye?: boolean;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  currency: 'USD' | 'DZD';
  exchangeRate: number;
  type: 'supplier_payment' | 'client_payment' | 'transport' | 'fees';
  reference: string;
  status: 'completed' | 'pending';
  supplierId?: string;
  supplier?: Supplier;
  clientId?: string;
  client?: Client;
  dossierId?: string;
}

export interface CreatePaymentData {
  date: string;
  amount: number;
  currency?: 'USD' | 'DZD';
  exchangeRate?: number;
  type: 'supplier_payment' | 'client_payment' | 'transport' | 'fees';
  reference: string;
  status?: 'completed' | 'pending';
  supplierId?: string;
  clientId?: string;
  dossierId?: string;
}

export interface DashboardStats {
  valeurStock: number;
  valeurChargees: number;
  creanceTotal: number;
  dettesTotal: number;
  totalEverything: number;
  totalCaisse: number;
  totalInvested: number;
  totalProfit: number;
  outstandingDebts: number;
  vehiclesInTransit: number;
  vehiclesArrived: number;
  vehiclesSold: number;
  vehiclesOrdered: number;
  totalVehicles: number;
  zakatBase: number;
  zakatAmount: number;
}

export interface DashboardFilterParams {
  month?: number;
  year?: number;
}

export interface ProfitHistory {
  month: string;
  profit: number;
}

export interface VehiclesByStatus {
  name: string;
  value: number;
  color: string;
}

export interface TopVehicle {
  brand: string;
  model: string;
  profit: number;
  margin: number;
}

export interface VehiclePayment {
  id: string;
  vehicleId: string;
  date: string;
  amountUSD: number;
  exchangeRate: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehiclePaymentData {
  date: string;
  amountUSD: number;
  exchangeRate: number;
}

export interface VehicleCharge {
  id: string;
  vehicleId: string;
  label: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehicleChargeData {
  label: string;
  amount: number;
}

export interface CaisseEntry {
  id: string;
  type: 'entree' | 'charge' | 'vente_auto';
  montant: number;
  date: string;
  description?: string;
  reference?: string;
  vehicleId?: string;
  vehicle?: Vehicle;
  clientId?: string;
  client?: Client;
  prixVente?: number;
  prixRevient?: number;
  benefice?: number;
  createdAt?: string;
}

export interface CreateCaisseEntryData {
  type: 'entree' | 'charge' | 'retrait';
  montant: number;
  date: string;
  description?: string;
  reference?: string;
  vehicleId?: string;
}

export interface CaisseSummary {
  totalEntrees: number;
  totalCharges: number;
  totalBenefices: number;
  soldeActuel: number;
}

export interface CaisseBalanceData {
  balance: number;
  updatedAt: string;
}

export interface ZakatRecord {
  id: string;
  year: number;
  assetsTotal: number;
  debtsTotal: number;
  zakatBase: number;
  zakatAmount: number;
  amountPaid: number;
  notes: string | null;
  createdAt: string;
}

export interface CreateZakatRecordData {
  year: number;
  assetsTotal: number;
  debtsTotal: number;
  zakatBase: number;
  zakatAmount: number;
  amountPaid?: number;
  notes?: string;
}

export interface UpdateZakatRecordData {
  amountPaid?: number;
  notes?: string;
}

export interface CarModel {
  id: string;
  brand: string;
  model: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCarModelData {
  brand: string;
  model: string;
  imageUrl?: string;
}

export interface Sale {
  id: string;
  clientId: string;
  client?: Client;
  date: string;
  totalSellingPrice: number;
  totalCost: number;
  totalProfit: number;
  amountPaid: number;
  debt: number;
  carriedDebt: number;
  vehicles?: Vehicle[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSaleData {
  clientId: string;
  date?: string;
  vehicles: { vehicleId: string; sellingPrice: number }[];
}

export const api = new ApiClient(API_URL);
