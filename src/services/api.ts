// ============================================================================
// Vehicle Import Hub — Frontend-only mock API client.
//
// Preserves the EXACT same exported `api` shape as the original NestJS-backed
// client so every page, hook, dialog, and react-query call keeps working
// without modification. All data lives in memory and persists to localStorage.
// ============================================================================

import {
  seedUsers,
  seedSuppliers,
  seedDossiers,
  seedConteneurs,
  seedVehicles,
  seedClients,
  seedPasseports,
  seedPayments,
  seedCaisseEntries,
  seedCarModels,
  seedSales,
  seedZakatRecords,
  seedVehiclePayments,
  seedVehicleCharges,
  seedCaisseBalance,
  seedBanqueBalance,
  DEMO_ACCOUNTS,
} from '@/mocks/seedData';

// ----------------------------- helpers --------------------------------------

const LS_KEY = 'vih_mock_db_v7';
const LATENCY = () => 120 + Math.random() * 180;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY()));
}

function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

interface DB {
  users: User[];
  suppliers: Supplier[];
  dossiers: Dossier[];
  conteneurs: Conteneur[];
  vehicles: Vehicle[];
  clients: Client[];
  passeports: Passeport[];
  payments: Payment[];
  caisseEntries: CaisseEntry[];
  carModels: CarModel[];
  sales: Sale[];
  zakatRecords: ZakatRecord[];
  vehiclePayments: VehiclePayment[];
  vehicleCharges: VehicleCharge[];
  caisseBalance: number;
  banqueBalance: number;
}

function loadDB(): DB {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw) as DB;
    } catch {
      /* ignore */
    }
  }
  return {
    users: [...seedUsers],
    suppliers: [...seedSuppliers],
    dossiers: [...seedDossiers],
    conteneurs: [...seedConteneurs],
    vehicles: [...seedVehicles],
    clients: [...seedClients],
    passeports: [...seedPasseports],
    payments: [...seedPayments],
    caisseEntries: [...seedCaisseEntries],
    carModels: [...seedCarModels],
    sales: [...seedSales],
    zakatRecords: [...seedZakatRecords],
    vehiclePayments: [...seedVehiclePayments],
    vehicleCharges: [...seedVehicleCharges],
    caisseBalance: seedCaisseBalance,
    banqueBalance: seedBanqueBalance,
  };
}

const db: DB = loadDB();

function persist(): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(db));
    } catch {
      /* quota or unavailable */
    }
  }
}

// Hydrate one-to-many relations on read so pages relying on `dossier.supplier`,
// `vehicle.supplier`, etc. keep working transparently.
function hydrateSupplier(s: Supplier): Supplier {
  return { ...s, dossiers: db.dossiers.filter((d) => d.supplierId === s.id) };
}
function hydrateDossier(d: Dossier): Dossier {
  return {
    ...d,
    supplier: db.suppliers.find((s) => s.id === d.supplierId),
    conteneurs: db.conteneurs.filter((c) => c.dossierId === d.id).map(hydrateConteneur),
  };
}
function hydrateConteneur(c: Conteneur): Conteneur {
  return {
    ...c,
    dossier: db.dossiers.find((d) => d.id === c.dossierId),
    vehicles: db.vehicles.filter((v) => v.conteneurId === c.id),
  };
}
function hydrateVehicle(v: Vehicle): Vehicle {
  const conteneur = db.conteneurs.find((c) => c.id === v.conteneurId);
  const conteneurHydrated = conteneur
    ? { ...conteneur, dossier: db.dossiers.find((d) => d.id === conteneur.dossierId) }
    : undefined;
  return {
    ...v,
    supplier: db.suppliers.find((s) => s.id === v.supplierId),
    client: v.clientId ? db.clients.find((c) => c.id === v.clientId) : undefined,
    conteneur: conteneurHydrated,
    passeport: v.passeportId ? db.passeports.find((p) => p.id === v.passeportId) : undefined,
  };
}
function hydrateClient(c: Client): Client {
  return { ...c, vehicles: db.vehicles.filter((v) => v.clientId === c.id) };
}
function hydratePayment(p: Payment): Payment {
  return {
    ...p,
    supplier: p.supplierId ? db.suppliers.find((s) => s.id === p.supplierId) : undefined,
    client: p.clientId ? db.clients.find((c) => c.id === p.clientId) : undefined,
  };
}
function hydrateSale(s: Sale): Sale {
  return {
    ...s,
    client: db.clients.find((c) => c.id === s.clientId),
    vehicles: db.vehicles.filter((v) => v.saleId === s.id),
  };
}

// ------------------------------ ApiClient -----------------------------------

class ApiClient {
  private currentUserId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentUserId = window.localStorage.getItem('mock_user_id');
    }
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('token', token);
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('mock_user_id');
    }
    this.currentUserId = null;
  }

  // ---- Auth ---------------------------------------------------------------
  async login(email: string, password: string) {
    await new Promise((r) => setTimeout(r, 800));
    // Try to match a seeded demo account first
    const demo = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase());
    let user: User;
    if (demo) {
      user = db.users.find((u) => u.email.toLowerCase() === demo.email.toLowerCase()) ?? db.users[0];
    } else {
      // Any other email/password also works → create / reuse a generic user
      const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        user = existing;
      } else {
        user = {
          id: uid('usr'),
          name: email.split('@')[0] || 'Utilisateur',
          email,
          role: 'user',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
        persist();
      }
    }
    this.setToken('mock-token');
    this.currentUserId = user.id;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('mock_user_id', user.id);
    }
    void password;
    return { accessToken: 'mock-token', user };
  }

  async logout() {
    await delay(undefined);
    this.removeToken();
  }

  async getMe(): Promise<User> {
    await delay(undefined);
    const user = this.currentUserId ? db.users.find((u) => u.id === this.currentUserId) : null;
    if (!user) throw new Error('Not authenticated');
    return user;
  }

  // ---- Users --------------------------------------------------------------
  async getUsers() { return delay(db.users.slice()); }
  async getUser(id: string) {
    const u = db.users.find((x) => x.id === id);
    if (!u) throw new Error('User introuvable');
    return delay(u);
  }
  async createUser(data: CreateUserData) {
    const u: User = {
      id: uid('usr'),
      name: data.name,
      email: data.email,
      role: data.role ?? 'user',
      status: data.status ?? 'active',
      createdAt: new Date().toISOString(),
    };
    db.users.push(u); persist(); return delay(u);
  }
  async updateUser(id: string, data: Partial<CreateUserData>) {
    const i = db.users.findIndex((x) => x.id === id);
    if (i < 0) throw new Error('User introuvable');
    db.users[i] = { ...db.users[i], ...data } as User; persist(); return delay(db.users[i]);
  }
  async deleteUser(id: string) {
    db.users = db.users.filter((u) => u.id !== id); persist(); return delay({});
  }

  // ---- Suppliers ----------------------------------------------------------
  async getSuppliers() { return delay(db.suppliers.map(hydrateSupplier)); }
  async getSupplier(id: string) {
    const s = db.suppliers.find((x) => x.id === id);
    if (!s) throw new Error('Fournisseur introuvable');
    return delay(hydrateSupplier(s));
  }
  async createSupplier(data: CreateSupplierData) {
    const s: Supplier = {
      id: uid('sup'),
      name: data.name,
      location: data.location,
      creditBalance: data.creditBalance ?? 0,
      totalPaid: data.totalPaid ?? 0,
      remainingDebt: data.remainingDebt ?? 0,
      vehiclesSupplied: data.vehiclesSupplied ?? 0,
      rating: data.rating ?? 0,
    };
    db.suppliers.push(s); persist(); return delay(s);
  }
  async updateSupplier(id: string, data: Partial<CreateSupplierData>) {
    const i = db.suppliers.findIndex((x) => x.id === id);
    if (i < 0) throw new Error('Fournisseur introuvable');
    db.suppliers[i] = { ...db.suppliers[i], ...data }; persist(); return delay(db.suppliers[i]);
  }
  async deleteSupplier(id: string) {
    db.suppliers = db.suppliers.filter((s) => s.id !== id); persist(); return delay({});
  }

  // ---- Dossiers -----------------------------------------------------------
  async getDossiers() { return delay(db.dossiers.map(hydrateDossier)); }
  async getDossier(id: string) {
    const d = db.dossiers.find((x) => x.id === id);
    if (!d) throw new Error('Dossier introuvable');
    return delay(hydrateDossier(d));
  }
  async createDossier(data: CreateDossierData) {
    const d: Dossier = {
      id: uid('dos'),
      reference: data.reference,
      supplierId: data.supplierId,
      dateCreation: data.dateCreation,
      status: data.status ?? 'en_cours',
    };
    db.dossiers.push(d); persist(); return delay(hydrateDossier(d));
  }
  async updateDossier(id: string, data: Partial<CreateDossierData>) {
    const i = db.dossiers.findIndex((x) => x.id === id);
    if (i < 0) throw new Error('Dossier introuvable');
    db.dossiers[i] = { ...db.dossiers[i], ...data }; persist(); return delay(hydrateDossier(db.dossiers[i]));
  }
  async deleteDossier(id: string) {
    db.dossiers = db.dossiers.filter((d) => d.id !== id); persist(); return delay({});
  }

  // ---- Conteneurs ---------------------------------------------------------
  async getConteneurs() { return delay(db.conteneurs.map(hydrateConteneur)); }
  async getConteneur(id: string) {
    const c = db.conteneurs.find((x) => x.id === id);
    if (!c) throw new Error('Conteneur introuvable');
    return delay(hydrateConteneur(c));
  }
  async createConteneur(data: CreateConteneurData) {
    const c: Conteneur = {
      id: uid('con'),
      numero: data.numero,
      dossierId: data.dossierId,
      type: data.type ?? '40ft',
      status: data.status ?? 'charge',
      coutTransport: data.coutTransport ?? 0,
      dateDepart: data.dateDepart,
      dateArrivee: data.dateArrivee,
    };
    db.conteneurs.push(c); persist(); return delay(hydrateConteneur(c));
  }
  async updateConteneur(id: string, data: Partial<CreateConteneurData>) {
    const i = db.conteneurs.findIndex((x) => x.id === id);
    if (i < 0) throw new Error('Conteneur introuvable');
    db.conteneurs[i] = { ...db.conteneurs[i], ...data }; persist(); return delay(hydrateConteneur(db.conteneurs[i]));
  }
  async deleteConteneur(id: string) {
    db.conteneurs = db.conteneurs.filter((c) => c.id !== id); persist(); return delay({});
  }

  // ---- Vehicles -----------------------------------------------------------
  async getVehicles() { return delay(db.vehicles.map(hydrateVehicle)); }
  async getVehicle(id: string) {
    const v = db.vehicles.find((x) => x.id === id);
    if (!v) throw new Error('Véhicule introuvable');
    return delay(hydrateVehicle(v));
  }
  async createVehicle(data: CreateVehicleData) {
    const v: Vehicle = {
      id: uid('veh'),
      brand: data.brand,
      model: data.model,
      year: data.year,
      vin: data.vin,
      clientId: data.clientId,
      supplierId: data.supplierId,
      conteneurId: data.conteneurId,
      passeportId: data.passeportId,
      status: (data.status as Vehicle['status']) ?? 'in_transit',
      purchasePrice: data.purchasePrice,
      transportCost: 0,
      theoreticalRate: data.theoreticalRate,
      passeportCost: data.passeportCost ?? 0,
      localFees: data.localFees ?? 0,
      totalCost: data.totalCost ?? 0,
      sellingPrice: data.sellingPrice,
      photoUrl: data.photoUrl,
      color: data.color,
      transmission: data.transmission as Vehicle['transmission'],
      paymentStatus: data.paymentStatus ?? null,
      amountPaid: data.amountPaid ?? 0,
      orderDate: data.orderDate,
      arrivalDate: data.arrivalDate,
      soldDate: data.soldDate,
    };
    db.vehicles.push(v); persist(); return delay(hydrateVehicle(v));
  }
  async updateVehicle(id: string, data: Partial<CreateVehicleData>) {
    const i = db.vehicles.findIndex((x) => x.id === id);
    if (i < 0) throw new Error('Véhicule introuvable');
    db.vehicles[i] = { ...db.vehicles[i], ...data } as Vehicle; persist(); return delay(hydrateVehicle(db.vehicles[i]));
  }
  async deleteVehicle(id: string) {
    db.vehicles = db.vehicles.filter((v) => v.id !== id); persist(); return delay({});
  }

  // ---- Vehicle Payments ---------------------------------------------------
  async getVehiclePayments(vehicleId: string) {
    return delay(db.vehiclePayments.filter((p) => p.vehicleId === vehicleId));
  }
  async createVehiclePayment(vehicleId: string, data: CreateVehiclePaymentData) {
    const p: VehiclePayment = { id: uid('vp'), vehicleId, ...data, createdAt: new Date().toISOString() };
    db.vehiclePayments.push(p); persist(); return delay(p);
  }
  async updateVehiclePayment(id: string, data: Partial<CreateVehiclePaymentData>) {
    const i = db.vehiclePayments.findIndex((x) => x.id === id);
    if (i < 0) throw new Error('Paiement introuvable');
    db.vehiclePayments[i] = { ...db.vehiclePayments[i], ...data } as VehiclePayment; persist(); return delay(db.vehiclePayments[i]);
  }
  async deleteVehiclePayment(id: string) {
    db.vehiclePayments = db.vehiclePayments.filter((p) => p.id !== id); persist(); return delay({});
  }

  // ---- Vehicle Charges ----------------------------------------------------
  async getVehicleCharges(vehicleId: string) {
    return delay(db.vehicleCharges.filter((c) => c.vehicleId === vehicleId));
  }
  async createVehicleCharge(vehicleId: string, data: CreateVehicleChargeData) {
    const c: VehicleCharge = { id: uid('vc'), vehicleId, ...data, createdAt: new Date().toISOString() };
    db.vehicleCharges.push(c); persist(); return delay(c);
  }
  async updateVehicleCharge(id: string, data: Partial<CreateVehicleChargeData>) {
    const i = db.vehicleCharges.findIndex((x) => x.id === id);
    if (i < 0) throw new Error('Charge introuvable');
    db.vehicleCharges[i] = { ...db.vehicleCharges[i], ...data } as VehicleCharge; persist(); return delay(db.vehicleCharges[i]);
  }
  async deleteVehicleCharge(id: string) {
    db.vehicleCharges = db.vehicleCharges.filter((c) => c.id !== id); persist(); return delay({});
  }

  // ---- Clients ------------------------------------------------------------
  async getClients() { return delay(db.clients.map(hydrateClient)); }
  async getClient(id: string) {
    const c = db.clients.find((x) => x.id === id);
    if (!c) throw new Error('Client introuvable');
    return delay(hydrateClient(c));
  }
  async createClient(data: CreateClientData) {
    const c: Client = {
      id: uid('cli'),
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
      adresse: data.adresse,
      email: data.email,
      company: data.company,
      pourcentageBenefice: data.pourcentageBenefice ?? 0,
      prixVente: data.prixVente ?? 0,
      coutRevient: data.coutRevient ?? 0,
      detteBenefice: data.detteBenefice ?? 0,
      paye: data.paye ?? false,
    };
    db.clients.push(c); persist(); return delay(hydrateClient(c));
  }
  async updateClient(id: string, data: Partial<CreateClientData>) {
    const i = db.clients.findIndex((x) => x.id === id);
    if (i < 0) throw new Error('Client introuvable');
    db.clients[i] = { ...db.clients[i], ...data }; persist(); return delay(hydrateClient(db.clients[i]));
  }
  async deleteClient(id: string) {
    db.clients = db.clients.filter((c) => c.id !== id); persist(); return delay({});
  }

  // ---- Passeports ---------------------------------------------------------
  async getPasseports() {
    const enriched = db.passeports.map((p) => ({
      ...p,
      vehicleCount: db.vehicles.filter((v) => v.passeportId === p.id).length,
    }));
    return delay(enriched);
  }
  async getPasseport(id: string) {
    const p = db.passeports.find((x) => x.id === id);
    if (!p) throw new Error('Passeport introuvable');
    const vehicles = db.vehicles.filter((v) => v.passeportId === id);
    return delay({ ...p, vehicles, vehicleCount: vehicles.length });
  }
  async createPasseport(data: CreatePasseportData) {
    const p: Passeport = {
      id: uid('pas'),
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
      adresse: data.adresse,
      numeroPasseport: data.numeroPasseport,
      nin: data.nin,
      pdfPasseport: data.pdfPasseport,
      montantDu: data.montantDu ?? 0,
      paye: data.paye ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.passeports.push(p); persist(); return delay(p);
  }
  async updatePasseport(id: string, data: Partial<CreatePasseportData>) {
    const i = db.passeports.findIndex((x) => x.id === id);
    if (i < 0) throw new Error('Passeport introuvable');
    db.passeports[i] = { ...db.passeports[i], ...data, updatedAt: new Date().toISOString() } as Passeport;
    persist(); return delay(db.passeports[i]);
  }
  async deletePasseport(id: string) {
    db.passeports = db.passeports.filter((p) => p.id !== id); persist(); return delay({});
  }

  // ---- Payments -----------------------------------------------------------
  async getPayments(dossierId?: string) {
    const list = dossierId ? db.payments.filter((p) => p.dossierId === dossierId) : db.payments;
    return delay(list.map(hydratePayment));
  }
  async getPayment(id: string) {
    const p = db.payments.find((x) => x.id === id);
    if (!p) throw new Error('Paiement introuvable');
    return delay(hydratePayment(p));
  }
  async createPayment(data: CreatePaymentData) {
    const p: Payment = {
      id: uid('pay'),
      date: data.date,
      amount: data.amount,
      currency: data.currency ?? 'DZD',
      exchangeRate: data.exchangeRate ?? 134.5,
      type: data.type,
      reference: data.reference,
      status: data.status ?? 'completed',
      supplierId: data.supplierId,
      clientId: data.clientId,
      dossierId: data.dossierId,
    };
    db.payments.push(p);

    // Side effects for completed supplier payments:
    //  1) Décrémenter le solde de la banque (montant converti en DZD si USD).
    //  2) Décrémenter la dette restante du fournisseur (en USD) et incrémenter son total payé.
    if (p.type === 'supplier_payment' && p.status === 'completed') {
      const amountDZD = p.currency === 'USD'
        ? Number(p.amount) * Number(p.exchangeRate || 0)
        : Number(p.amount);
      db.banqueBalance = Number(db.banqueBalance || 0) - amountDZD;

      if (p.supplierId) {
        const sIdx = db.suppliers.findIndex((s) => s.id === p.supplierId);
        if (sIdx >= 0) {
          const amountUSD = p.currency === 'USD'
            ? Number(p.amount)
            : Number(p.exchangeRate) > 0 ? Number(p.amount) / Number(p.exchangeRate) : 0;
          db.suppliers[sIdx] = {
            ...db.suppliers[sIdx],
            totalPaid: Number(db.suppliers[sIdx].totalPaid || 0) + amountUSD,
            remainingDebt: Number(db.suppliers[sIdx].remainingDebt || 0) - amountUSD,
          };
        }
      }
    }

    persist();
    return delay(hydratePayment(p));
  }
  async updatePayment(id: string, data: Partial<CreatePaymentData>) {
    const i = db.payments.findIndex((x) => x.id === id);
    if (i < 0) throw new Error('Paiement introuvable');
    db.payments[i] = { ...db.payments[i], ...data } as Payment; persist(); return delay(hydratePayment(db.payments[i]));
  }
  async deletePayment(id: string) {
    db.payments = db.payments.filter((p) => p.id !== id); persist(); return delay({});
  }

  // ---- Caisse -------------------------------------------------------------
  async getCaisseEntries() { return delay(db.caisseEntries.slice()); }
  async getCaisseEntry(id: string) {
    const e = db.caisseEntries.find((x) => x.id === id);
    if (!e) throw new Error('Entrée introuvable');
    return delay(e);
  }
  async getCaisseSummary(): Promise<CaisseSummary> {
    const totalEntrees = db.caisseEntries.filter((e) => e.type === 'entree').reduce((s, e) => s + e.montant, 0);
    const totalCharges = db.caisseEntries.filter((e) => e.type === 'charge').reduce((s, e) => s + e.montant, 0);
    const totalBenefices = db.caisseEntries.filter((e) => e.type === 'vente_auto').reduce((s, e) => s + (e.benefice ?? 0), 0);
    const totalVirements = db.caisseEntries.filter((e) => e.paymentMethod === 'virement').reduce((s, e) => s + e.montant, 0);
    const totalSupplierPayments = db.payments.filter((p) => p.type === 'supplier_payment').reduce((s, p) => s + p.amount, 0);
    return delay({
      totalEntrees,
      totalCharges,
      totalBenefices,
      soldeActuel: db.caisseBalance,
      totalVirements,
      totalSupplierPayments,
    });
  }
  async getCaisseBalance(): Promise<CaisseBalanceData> {
    return delay({ balance: db.caisseBalance, updatedAt: new Date().toISOString() });
  }
  async setCaisseBalance(balance: number): Promise<CaisseBalanceData> {
    db.caisseBalance = balance; persist(); return delay({ balance, updatedAt: new Date().toISOString() });
  }
  async getBanqueBalance(): Promise<CaisseBalanceData> {
    return delay({ balance: db.banqueBalance, updatedAt: new Date().toISOString() });
  }
  async setBanqueBalance(balance: number): Promise<CaisseBalanceData> {
    db.banqueBalance = balance; persist(); return delay({ balance, updatedAt: new Date().toISOString() });
  }
  async createCaisseEntry(data: CreateCaisseEntryData) {
    const mapped: CaisseEntry = {
      id: uid('cai'),
      type: (data.type === 'retrait' ? 'charge' : data.type) as CaisseEntry['type'],
      montant: data.montant,
      date: data.date,
      description: data.description,
      reference: data.reference,
      vehicleId: data.vehicleId,
      paymentMethod: data.paymentMethod ?? 'versement',
      createdAt: new Date().toISOString(),
    };
    db.caisseEntries.unshift(mapped);
    if (mapped.type === 'entree') db.caisseBalance += mapped.montant;
    else db.caisseBalance -= mapped.montant;
    persist();
    return delay(mapped);
  }
  async updateCaisseEntry(id: string, data: Partial<CreateCaisseEntryData>) {
    const i = db.caisseEntries.findIndex((x) => x.id === id);
    if (i < 0) throw new Error('Entrée introuvable');
    db.caisseEntries[i] = { ...db.caisseEntries[i], ...data } as CaisseEntry; persist(); return delay(db.caisseEntries[i]);
  }
  async deleteCaisseEntry(id: string) {
    db.caisseEntries = db.caisseEntries.filter((e) => e.id !== id); persist(); return delay({});
  }
  async purgeCaisse() {
    const n = db.caisseEntries.length;
    db.caisseEntries = []; persist(); return delay({ deleted: n });
  }
  async purgeBanque() {
    const list = db.caisseEntries.filter((e) => e.paymentMethod === 'virement');
    db.caisseEntries = db.caisseEntries.filter((e) => e.paymentMethod !== 'virement');
    persist(); return delay({ deleted: list.length });
  }

  // ---- Car Models ---------------------------------------------------------
  async getCarModels(brand?: string) {
    const list = brand ? db.carModels.filter((m) => m.brand.toLowerCase() === brand.toLowerCase()) : db.carModels;
    return delay(list.slice());
  }
  async getCarModel(id: string) {
    const m = db.carModels.find((x) => x.id === id);
    if (!m) throw new Error('Modèle introuvable');
    return delay(m);
  }
  async createCarModel(data: CreateCarModelData) {
    const m: CarModel = { id: uid('mdl'), ...data, createdAt: new Date().toISOString() };
    db.carModels.push(m); persist(); return delay(m);
  }
  async updateCarModel(id: string, data: Partial<CreateCarModelData>) {
    const i = db.carModels.findIndex((x) => x.id === id);
    if (i < 0) throw new Error('Modèle introuvable');
    db.carModels[i] = { ...db.carModels[i], ...data, updatedAt: new Date().toISOString() } as CarModel; persist(); return delay(db.carModels[i]);
  }
  async deleteCarModel(id: string) {
    db.carModels = db.carModels.filter((m) => m.id !== id); persist(); return delay({});
  }

  // ---- Dashboard ----------------------------------------------------------
  async getDashboardStats(_params?: DashboardFilterParams): Promise<DashboardStats> {
    const valeurStock = db.vehicles.filter((v) => v.status === 'arrived').reduce((s, v) => s + (v.totalCost ?? 0), 0);
    const valeurChargees = db.vehicles
      .filter((v) => v.status === 'in_transit' || v.status === 'ordered')
      .reduce((s, v) => s + v.purchasePrice + v.transportCost, 0);
    const creanceTotal = db.clients.reduce((s, c) => s + (c.detteBenefice ?? 0), 0);
    const dettesTotal = db.suppliers.reduce((s, sp) => s + (sp.remainingDebt ?? 0), 0);
    const totalCaisse = db.caisseBalance + db.banqueBalance;
    const totalEverything = valeurStock + valeurChargees + creanceTotal + totalCaisse;
    const totalProfit = db.sales.reduce((s, sa) => s + sa.totalProfit, 0);
    const totalInvested = db.vehicles.reduce((s, v) => s + (v.totalCost ?? 0), 0);
    const zakatBase = totalEverything - dettesTotal;
    return delay({
      valeurStock,
      valeurChargees,
      creanceTotal,
      dettesTotal,
      totalEverything,
      totalCaisse,
      totalInvested,
      totalProfit,
      outstandingDebts: dettesTotal,
      vehiclesInTransit: db.vehicles.filter((v) => v.status === 'in_transit').length,
      vehiclesArrived: db.vehicles.filter((v) => v.status === 'arrived').length,
      vehiclesSold: db.vehicles.filter((v) => v.status === 'sold').length,
      vehiclesOrdered: db.vehicles.filter((v) => v.status === 'ordered').length,
      totalVehicles: db.vehicles.length,
      zakatBase,
      zakatAmount: Math.round(zakatBase * 0.025),
    });
  }
  async getProfitHistory(_params?: { year?: number }): Promise<ProfitHistory[]> {
    return delay([
      { month: 'Nov', profit: 280000 },
      { month: 'Déc', profit: 420000 },
      { month: 'Jan', profit: 380000 },
      { month: 'Fév', profit: 540000 },
      { month: 'Mar', profit: 1040000 },
      { month: 'Avr', profit: 900000 },
    ]);
  }
  async getVehiclesByStatus(_params?: DashboardFilterParams): Promise<VehiclesByStatus[]> {
    return delay([
      { name: 'Commandé', value: db.vehicles.filter((v) => v.status === 'ordered').length,    color: 'hsl(0, 72%, 50%)' },
      { name: 'Chargée',  value: db.vehicles.filter((v) => v.status === 'in_transit').length, color: 'hsl(38, 92%, 50%)' },
      { name: 'Arrivé',   value: db.vehicles.filter((v) => v.status === 'arrived').length,    color: 'hsl(142, 71%, 45%)' },
      { name: 'Vendu',    value: db.vehicles.filter((v) => v.status === 'sold').length,       color: 'hsl(0, 0%, 45%)' },
    ]);
  }
  async getTopVehicles(_params?: DashboardFilterParams): Promise<TopVehicle[]> {
    return delay(
      db.vehicles
        .filter((v) => v.sellingPrice && v.sellingPrice > 0)
        .map((v) => {
          const profit = (v.sellingPrice ?? 0) - (v.totalCost ?? 0);
          const margin = v.sellingPrice ? Number(((profit / v.sellingPrice) * 100).toFixed(1)) : 0;
          return { brand: v.brand, model: v.model, profit, margin };
        })
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 5)
    );
  }

  // ---- Zakat --------------------------------------------------------------
  async getZakatRecords() { return delay(db.zakatRecords.slice()); }
  async createZakatRecord(data: CreateZakatRecordData) {
    const r: ZakatRecord = {
      id: uid('zak'),
      year: data.year,
      assetsTotal: data.assetsTotal,
      debtsTotal: data.debtsTotal,
      zakatBase: data.zakatBase,
      zakatAmount: data.zakatAmount,
      amountPaid: data.amountPaid ?? 0,
      notes: data.notes ?? null,
      createdAt: new Date().toISOString(),
    };
    db.zakatRecords.push(r); persist(); return delay(r);
  }
  async updateZakatRecord(id: string, data: UpdateZakatRecordData) {
    const i = db.zakatRecords.findIndex((x) => x.id === id);
    if (i < 0) throw new Error('Enregistrement introuvable');
    db.zakatRecords[i] = { ...db.zakatRecords[i], ...data } as ZakatRecord; persist(); return delay(db.zakatRecords[i]);
  }
  async deleteZakatRecord(id: string) {
    db.zakatRecords = db.zakatRecords.filter((r) => r.id !== id); persist(); return delay(undefined as unknown as void);
  }

  // ---- Sales --------------------------------------------------------------
  async getSales() { return delay(db.sales.map(hydrateSale)); }
  async getSalesByClient(clientId: string) {
    return delay(db.sales.filter((s) => s.clientId === clientId).map(hydrateSale));
  }
  async getSale(id: string) {
    const s = db.sales.find((x) => x.id === id);
    if (!s) throw new Error('Vente introuvable');
    return delay(hydrateSale(s));
  }
  async createSale(data: CreateSaleData) {
    const totalSellingPrice = data.vehicles.reduce((s, v) => s + v.sellingPrice, 0);
    const totalCost = data.vehicles.reduce((s, vv) => {
      const veh = db.vehicles.find((x) => x.id === vv.vehicleId);
      return s + (veh?.totalCost ?? 0);
    }, 0);
    const sale: Sale = {
      id: uid('sal'),
      clientId: data.clientId,
      date: data.date ?? new Date().toISOString().slice(0, 10),
      totalSellingPrice,
      totalCost,
      totalProfit: totalSellingPrice - totalCost,
      amountPaid: 0,
      debt: totalSellingPrice,
      carriedDebt: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.sales.push(sale);
    data.vehicles.forEach(({ vehicleId, sellingPrice }) => {
      const v = db.vehicles.find((x) => x.id === vehicleId);
      if (v) {
        v.saleId = sale.id;
        v.sellingPrice = sellingPrice;
        v.status = 'sold';
        v.soldDate = sale.date;
      }
    });
    persist(); return delay(hydrateSale(sale));
  }
  async addSalePayment(saleId: string, amount: number) {
    const s = db.sales.find((x) => x.id === saleId);
    if (!s) throw new Error('Vente introuvable');
    s.amountPaid += amount;
    s.debt = Math.max(0, s.totalSellingPrice - s.amountPaid);
    s.updatedAt = new Date().toISOString();
    persist(); return delay(hydrateSale(s));
  }
  async deleteSale(id: string) {
    db.sales = db.sales.filter((s) => s.id !== id); persist(); return delay({});
  }

  // ---- Generic request shim ------------------------------------------------
  // Some pages still call `api.request<T>('/api/...')` directly for endpoints
  // that didn't get wrapped in dedicated methods. We route them here against
  // the in-memory store so those pages keep working unmodified.
  async request<T = unknown>(endpoint: string, options?: { method?: string }): Promise<T> {
    // Dossier payment stats: /api/payments/dossier/:id/stats
    const dossierStats = endpoint.match(/^\/api\/payments\/dossier\/([^/]+)\/stats/);
    if (dossierStats) {
      const dossierId = dossierStats[1];
      const dossierVehicles = db.vehicles.filter((v) => {
        const c = db.conteneurs.find((cn) => cn.id === v.conteneurId);
        return c?.dossierId === dossierId;
      });
      // Total dû en USD = somme (prix véhicule + transport) pour tous les véhicules du dossier
      const totalDue = dossierVehicles.reduce(
        (s, v) => s + (Number(v.purchasePrice) || 0) + (Number(v.transportCost) || 0),
        0
      );
      // Paiements fournisseur du dossier (USD uniquement, type supplier_payment)
      const supplierPayments = db.payments.filter(
        (p) => p.dossierId === dossierId && p.type === 'supplier_payment' && p.currency === 'USD'
      );
      const totalPaid = supplierPayments.reduce((s, p) => s + Number(p.amount), 0);
      const totalPaidDZD = supplierPayments.reduce(
        (s, p) => s + Number(p.amount) * Number(p.exchangeRate || 0),
        0
      );
      const remaining = totalDue - totalPaid; // peut être négatif (crédit)
      const progress = totalDue > 0 ? Math.min(100, Math.round((totalPaid / totalDue) * 100)) : 0;
      return delay({
        totalDue,
        totalPaid,
        totalPaidDZD,
        remaining,
        progress,
        vehiclesCount: dossierVehicles.length,
        payments: supplierPayments.map(hydratePayment),
      } as T);
    }

    // Global search: /api/search?q=...
    if (endpoint.startsWith('/api/search')) {
      const q = decodeURIComponent(endpoint.split('q=')[1] ?? '').toLowerCase();
      return delay({
        dossiers: db.dossiers.filter((d) => d.reference.toLowerCase().includes(q)).map(hydrateDossier),
        clients: db.clients.filter((c) =>
          `${c.nom} ${c.prenom} ${c.email ?? ''} ${c.company ?? ''}`.toLowerCase().includes(q)
        ).map(hydrateClient),
        vehicles: db.vehicles.filter((v) =>
          v.vin.toLowerCase().includes(q) ||
          `${v.brand} ${v.model}`.toLowerCase().includes(q)
        ).map(hydrateVehicle),
      } as T);
    }

    // Recalculate-all-costs: no-op in the mock (mutation only)
    if (endpoint.includes('/payments/recalculate-all-costs')) {
      void options;
      return delay({ ok: true, recalculated: db.vehicles.length } as T);
    }

    // Unknown endpoint — return an empty payload to avoid crashes.
    console.warn('[mock-api] Unhandled endpoint:', endpoint);
    return delay({} as T);
  }
}

// ============================================================================
// Types — kept identical to the previous backend-bound client so all consumers
// (hooks, dialogs, pages) continue to compile without any modification.
// ============================================================================

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
  paymentMethod?: 'versement' | 'virement';
  createdAt?: string;
}

export interface CreateCaisseEntryData {
  type: 'entree' | 'charge' | 'retrait';
  montant: number;
  date: string;
  description?: string;
  reference?: string;
  vehicleId?: string;
  paymentMethod?: 'versement' | 'virement';
}

export interface CaisseSummary {
  totalEntrees: number;
  totalCharges: number;
  totalBenefices: number;
  soldeActuel: number;
  totalVirements: number;
  totalSupplierPayments: number;
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


export const api = new ApiClient();
