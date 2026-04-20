// In-memory seed data for the frontend-only "Vehicle Import Hub" demo.
// All entities preserve the exact shapes used by the original API so existing
// hooks, dialogs, and pages keep working without modification.

import type {
  User,
  Supplier,
  Dossier,
  Conteneur,
  Vehicle,
  Client,
  Passeport,
  Payment,
  CaisseEntry,
  CarModel,
  Sale,
  ZakatRecord,
  VehiclePayment,
  VehicleCharge,
} from '@/services/api';

export interface DemoAccount {
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
  name: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'admin@vehicleimporthub.com',   password: 'demo1234', role: 'admin',   name: 'Administrateur 1' },
  { email: 'manager@vehicleimporthub.com', password: 'demo1234', role: 'manager', name: 'Manager 1' },
  { email: 'user@vehicleimporthub.com',    password: 'demo1234', role: 'user',    name: 'Utilisateur 1' },
];

export const seedUsers: User[] = DEMO_ACCOUNTS.map((acc, i) => ({
  id: `usr-${i + 1}`,
  name: acc.name,
  email: acc.email,
  role: acc.role,
  status: 'active',
  lastActive: '2026-04-19',
  createdAt: '2025-09-01',
}));

export const seedSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'Guangzhou Auto Export',  location: 'Guangzhou, Chine', creditBalance: 12000,  totalPaid: 420000, remainingDebt: 35000, vehiclesSupplied: 4, rating: 4.8 },
  { id: 'sup-2', name: 'Shanghai Motors Ltd',    location: 'Shanghai, Chine',  creditBalance: 18500,  totalPaid: 580000, remainingDebt: 22000, vehiclesSupplied: 5, rating: 4.9 },
  { id: 'sup-3', name: 'Shenzhen Auto Hub',      location: 'Shenzhen, Chine',  creditBalance: 6500,   totalPaid: 295000, remainingDebt: 18000, vehiclesSupplied: 3, rating: 4.6 },
  { id: 'sup-4', name: 'Beijing Premium Cars',   location: 'Beijing, Chine',   creditBalance: 9000,   totalPaid: 340000, remainingDebt: 12500, vehiclesSupplied: 2, rating: 4.7 },
  { id: 'sup-5', name: 'Tianjin Trade Co',       location: 'Tianjin, Chine',   creditBalance: 4200,   totalPaid: 180000, remainingDebt: 8000,  vehiclesSupplied: 1, rating: 4.5 },
];

export const seedDossiers: Dossier[] = [
  { id: 'dos-1', reference: 'GUANGZHOU-2026-001', supplierId: 'sup-1', dateCreation: '2026-01-08', status: 'en_cours' },
  { id: 'dos-2', reference: 'SHANGHAI-2026-001',  supplierId: 'sup-2', dateCreation: '2026-01-15', status: 'en_cours' },
  { id: 'dos-3', reference: 'SHENZHEN-2026-001',  supplierId: 'sup-3', dateCreation: '2026-02-02', status: 'en_cours' },
  { id: 'dos-4', reference: 'BEIJING-2026-001',   supplierId: 'sup-4', dateCreation: '2026-02-10', status: 'solde'   },
  { id: 'dos-5', reference: 'TIANJIN-2026-001',   supplierId: 'sup-5', dateCreation: '2026-03-01', status: 'en_cours' },
];

export const seedConteneurs: Conteneur[] = [
  { id: 'con-1', numero: 'MSCU-1234567', dossierId: 'dos-1', type: '40ft_hc', status: 'arrivee', coutTransport: 4200, dateDepart: '2026-01-12', dateArrivee: '2026-02-20' },
  { id: 'con-2', numero: 'MSCU-1234568', dossierId: 'dos-1', type: '40ft',    status: 'charge',  coutTransport: 3800, dateDepart: '2026-02-01' },
  { id: 'con-3', numero: 'COSU-9988776', dossierId: 'dos-2', type: '40ft_hc', status: 'arrivee', coutTransport: 4500, dateDepart: '2026-01-20', dateArrivee: '2026-03-01' },
  { id: 'con-4', numero: 'COSU-9988777', dossierId: 'dos-2', type: '40ft',    status: 'charge',  coutTransport: 3700, dateDepart: '2026-02-12' },
  { id: 'con-5', numero: 'EVRG-5544332', dossierId: 'dos-3', type: '20ft',    status: 'charge',  coutTransport: 2400, dateDepart: '2026-02-15' },
  { id: 'con-6', numero: 'EVRG-5544333', dossierId: 'dos-4', type: '40ft_hc', status: 'decharge', coutTransport: 4300, dateDepart: '2026-02-15', dateArrivee: '2026-03-25' },
  { id: 'con-7', numero: 'HLCU-7766554', dossierId: 'dos-5', type: '40ft',    status: 'charge',  coutTransport: 3600, dateDepart: '2026-03-08' },
  { id: 'con-8', numero: 'HLCU-7766555', dossierId: 'dos-5', type: '20ft',    status: 'charge',  coutTransport: 2300, dateDepart: '2026-03-10' },
];

export const seedClients: Client[] = [
  { id: 'cli-1', nom: 'Benali',    prenom: 'Ahmed',   telephone: '+213 555 123 456', email: 'ahmed@benali.dz',   company: 'Benali Auto',    pourcentageBenefice: 7,  prixVente: 9500000, coutRevient: 8800000, detteBenefice: 0,      paye: true  },
  { id: 'cli-2', nom: 'Hadj',      prenom: 'Karim',   telephone: '+213 555 234 567', email: 'karim@hadj.dz',     company: 'Hadj Motors',    pourcentageBenefice: 6,  prixVente: 7200000, coutRevient: 6750000, detteBenefice: 250000, paye: false },
  { id: 'cli-3', nom: 'Mansouri',  prenom: 'Youcef',  telephone: '+213 555 345 678', email: 'youcef@mansouri.dz',company: 'Premium Cars',   pourcentageBenefice: 8,  prixVente: 11200000,coutRevient: 10300000,detteBenefice: 0,      paye: true  },
  { id: 'cli-4', nom: 'Zerrouki',  prenom: 'Fatima',  telephone: '+213 555 456 789', email: 'fatima@fz.dz',      company: 'FZ Auto',        pourcentageBenefice: 6,  prixVente: 6800000, coutRevient: 6400000, detteBenefice: 120000, paye: false },
  { id: 'cli-5', nom: 'Bensalem',  prenom: 'Omar',    telephone: '+213 555 567 890', email: 'omar@bensalem.dz',  company: 'OB Motors',      pourcentageBenefice: 7,  prixVente: 12500000,coutRevient: 11600000,detteBenefice: 0,      paye: true  },
  { id: 'cli-6', nom: 'Khelifi',   prenom: 'Sara',    telephone: '+213 555 678 901', email: 'sara@khelifi.dz',   company: 'Khelifi Cars',   pourcentageBenefice: 5,  prixVente: 5900000, coutRevient: 5600000, detteBenefice: 80000,  paye: false },
];

export const seedPasseports: Passeport[] = [
  { id: 'pas-1', nom: 'Benali',   prenom: 'Ahmed',   telephone: '+213 555 123 456', adresse: 'Alger Centre',  numeroPasseport: 'PA1234567', nin: '109810199012345', montantDu: 50000,  paye: true,  createdAt: '2026-01-10', updatedAt: '2026-01-10' },
  { id: 'pas-2', nom: 'Hadj',     prenom: 'Karim',   telephone: '+213 555 234 567', adresse: 'Oran',          numeroPasseport: 'PA2345678', nin: '109820199123456', montantDu: 50000,  paye: false, createdAt: '2026-01-12', updatedAt: '2026-01-12' },
  { id: 'pas-3', nom: 'Mansouri', prenom: 'Youcef',  telephone: '+213 555 345 678', adresse: 'Constantine',   numeroPasseport: 'PA3456789', nin: '109790299234567', montantDu: 50000,  paye: true,  createdAt: '2026-01-14', updatedAt: '2026-01-14' },
  { id: 'pas-4', nom: 'Zerrouki', prenom: 'Fatima',  telephone: '+213 555 456 789', adresse: 'Annaba',        numeroPasseport: 'PA4567890', nin: '209850399345678', montantDu: 50000,  paye: false, createdAt: '2026-01-20', updatedAt: '2026-01-20' },
  { id: 'pas-5', nom: 'Bensalem', prenom: 'Omar',    telephone: '+213 555 567 890', adresse: 'Sétif',         numeroPasseport: 'PA5678901', nin: '109880499456789', montantDu: 50000,  paye: true,  createdAt: '2026-02-02', updatedAt: '2026-02-02' },
  { id: 'pas-6', nom: 'Khelifi',  prenom: 'Sara',    telephone: '+213 555 678 901', adresse: 'Tlemcen',       numeroPasseport: 'PA6789012', nin: '209910599567890', montantDu: 50000,  paye: false, createdAt: '2026-02-08', updatedAt: '2026-02-08' },
  { id: 'pas-7', nom: 'Lamri',    prenom: 'Toufik',  telephone: '+213 555 789 012', adresse: 'Béjaïa',        numeroPasseport: 'PA7890123', nin: '109870699678901', montantDu: 50000,  paye: true,  createdAt: '2026-02-15', updatedAt: '2026-02-15' },
  { id: 'pas-8', nom: 'Cherif',   prenom: 'Nadia',   telephone: '+213 555 890 123', adresse: 'Blida',         numeroPasseport: 'PA8901234', nin: '209840799789012', montantDu: 50000,  paye: false, createdAt: '2026-02-22', updatedAt: '2026-02-22' },
  { id: 'pas-9', nom: 'Yahiaoui', prenom: 'Mehdi',   telephone: '+213 555 901 234', adresse: 'Tizi Ouzou',    numeroPasseport: 'PA9012345', nin: '109890899890123', montantDu: 50000,  paye: true,  createdAt: '2026-03-01', updatedAt: '2026-03-01' },
  { id: 'pas-10',nom: 'Ouali',    prenom: 'Amina',   telephone: '+213 555 012 345', adresse: 'Médéa',         numeroPasseport: 'PA0123456', nin: '209860999901234', montantDu: 50000,  paye: false, createdAt: '2026-03-10', updatedAt: '2026-03-10' },
];

const photo = (q: string) => `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=800&q=80`;

export const seedVehicles: Vehicle[] = [
  // SOLD vehicles — each sold vehicle is linked to a Sale via saleId (see seedSales below)
  { id: 'veh-1',  brand: 'Toyota',   model: 'Land Cruiser', year: 2024, vin: 'JTMWF4DV4P5012345', clientId: 'cli-1', supplierId: 'sup-1', conteneurId: 'con-1', passeportId: 'pas-1', saleId: 'sal-5', status: 'sold',       purchasePrice: 45000, transportCost: 2500, theoreticalRate: 134, passeportCost: 50000,  localFees: 320000, totalCost: 6730000,  sellingPrice: 7200000,  photoUrl: photo('1503376780353-7e6692767b70'), color: 'Blanc',  transmission: 'automatic', paymentStatus: 'solde',     amountPaid: 7200000,  orderDate: '2026-01-08', arrivalDate: '2026-02-20', soldDate: '2026-04-15' },
  { id: 'veh-2',  brand: 'Mercedes', model: 'GLE 450',      year: 2024, vin: 'W1N2534861A123456', clientId: 'cli-2', supplierId: 'sup-1', conteneurId: 'con-1', passeportId: 'pas-2', saleId: 'sal-4', status: 'sold',       purchasePrice: 62000, transportCost: 2800, theoreticalRate: 134, passeportCost: 50000,  localFees: 410000, totalCost: 9148000,  sellingPrice: 9800000,  photoUrl: photo('1618843479313-40f8afb4b4d8'), color: 'Noir',   transmission: 'automatic', paymentStatus: 'versement', amountPaid: 4500000,  orderDate: '2026-01-08', arrivalDate: '2026-02-20', soldDate: '2026-03-22' },
  { id: 'veh-3',  brand: 'BMW',      model: 'X5 M50i',      year: 2024, vin: '5UXCR6C51N9A12345', clientId: 'cli-3', supplierId: 'sup-1', conteneurId: 'con-2', passeportId: 'pas-3', status: 'in_transit', purchasePrice: 58000, transportCost: 2600, theoreticalRate: 134, passeportCost: 50000,  localFees: 380000, totalCost: 8530000,  sellingPrice: 9200000,  photoUrl: photo('1555215695-3004980ad54e'), color: 'Bleu',   transmission: 'automatic', paymentStatus: 'versement', amountPaid: 3000000,  orderDate: '2026-02-01' },
  { id: 'veh-4',  brand: 'Audi',     model: 'Q8',           year: 2024, vin: 'WAUZZZF18PN012345', clientId: 'cli-4', supplierId: 'sup-2', conteneurId: 'con-3', passeportId: 'pas-4', status: 'arrived',    purchasePrice: 55000, transportCost: 2700, theoreticalRate: 134, passeportCost: 50000,  localFees: 390000, totalCost: 8160000,  sellingPrice: 8750000,  photoUrl: photo('1606664515524-ed2f786a0bd6'), color: 'Gris',   transmission: 'automatic', paymentStatus: 'solde',     amountPaid: 8750000,  orderDate: '2026-01-15', arrivalDate: '2026-03-01' },
  { id: 'veh-5',  brand: 'Porsche',  model: 'Cayenne',      year: 2024, vin: 'WP1AB2A53PLB12345', clientId: 'cli-5', supplierId: 'sup-2', conteneurId: 'con-3', passeportId: 'pas-5', saleId: 'sal-3', status: 'sold',       purchasePrice: 78000, transportCost: 3200, theoreticalRate: 134, passeportCost: 50000,  localFees: 520000, totalCost: 11460000, sellingPrice: 12500000, photoUrl: photo('1503376780353-7e6692767b70'), color: 'Rouge',  transmission: 'automatic', paymentStatus: 'solde',     amountPaid: 12500000, orderDate: '2026-01-15', arrivalDate: '2026-03-01', soldDate: '2026-03-05' },
  { id: 'veh-6',  brand: 'Lexus',    model: 'LX 600',       year: 2024, vin: 'JTJHY00W104012345', clientId: undefined, supplierId: 'sup-2', conteneurId: 'con-4', passeportId: undefined, status: 'in_transit', purchasePrice: 88000, transportCost: 3400, theoreticalRate: 134, passeportCost: 0,      localFees: 540000, totalCost: 12758000, sellingPrice: undefined,    photoUrl: photo('1552519507-da3b142c6e3d'), color: 'Blanc',  transmission: 'automatic', paymentStatus: null,        amountPaid: 0,        orderDate: '2026-02-12' },
  { id: 'veh-7',  brand: 'Range Rover', model: 'Vogue',     year: 2024, vin: 'SALGS2RU1NA012345', clientId: 'cli-6', supplierId: 'sup-3', conteneurId: 'con-5', passeportId: 'pas-6', status: 'in_transit', purchasePrice: 95000, transportCost: 2400, theoreticalRate: 134, passeportCost: 50000,  localFees: 580000, totalCost: 13360000, sellingPrice: 14200000, photoUrl: photo('1606664515524-ed2f786a0bd6'), color: 'Noir',   transmission: 'automatic', paymentStatus: 'versement', amountPaid: 5000000,  orderDate: '2026-02-15' },
  { id: 'veh-8',  brand: 'Toyota',   model: 'Hilux',        year: 2024, vin: 'MR0FZ22G900012345', clientId: undefined, supplierId: 'sup-3', conteneurId: 'con-5', passeportId: undefined, status: 'in_transit', purchasePrice: 32000, transportCost: 2200, theoreticalRate: 134, passeportCost: 0,      localFees: 240000, totalCost: 4830000,  sellingPrice: undefined,    photoUrl: photo('1568605114967-8130f3a36994'), color: 'Beige',  transmission: 'manual',    paymentStatus: null,        amountPaid: 0,        orderDate: '2026-02-15' },
  { id: 'veh-9',  brand: 'Hyundai',  model: 'Tucson',       year: 2024, vin: 'KMHJ281AGNU012345', clientId: 'cli-1', supplierId: 'sup-4', conteneurId: 'con-6', passeportId: 'pas-7', saleId: 'sal-1', status: 'sold',       purchasePrice: 28000, transportCost: 2300, theoreticalRate: 134, passeportCost: 50000,  localFees: 210000, totalCost: 4310000,  sellingPrice: 4750000,  photoUrl: photo('1552519507-da3b142c6e3d'), color: 'Argent', transmission: 'automatic', paymentStatus: 'solde',     amountPaid: 4750000,  orderDate: '2026-02-10', arrivalDate: '2026-03-25', soldDate: '2026-04-02' },
  { id: 'veh-10', brand: 'Kia',      model: 'Sorento',      year: 2024, vin: 'KNDPM3AC9N7012345', clientId: 'cli-3', supplierId: 'sup-4', conteneurId: 'con-6', passeportId: 'pas-8', saleId: 'sal-2', status: 'sold',       purchasePrice: 30000, transportCost: 2300, theoreticalRate: 134, passeportCost: 50000,  localFees: 220000, totalCost: 4590000,  sellingPrice: 5050000,  photoUrl: photo('1606664515524-ed2f786a0bd6'), color: 'Bleu',   transmission: 'automatic', paymentStatus: 'solde',     amountPaid: 5050000,  orderDate: '2026-02-10', arrivalDate: '2026-03-25', soldDate: '2026-04-05' },
  { id: 'veh-11', brand: 'Nissan',   model: 'Patrol',       year: 2024, vin: 'JN8AY2NC0N9012345', clientId: undefined, supplierId: 'sup-5', conteneurId: 'con-7', passeportId: undefined, status: 'ordered',    purchasePrice: 72000, transportCost: 3300, theoreticalRate: 134, passeportCost: 0,      localFees: 470000, totalCost: 10550000, sellingPrice: undefined,    photoUrl: photo('1503376780353-7e6692767b70'), color: 'Blanc',  transmission: 'automatic', paymentStatus: null,        amountPaid: 0,        orderDate: '2026-03-08' },
  { id: 'veh-12', brand: 'Mazda',    model: 'CX-5',         year: 2024, vin: 'JM3KFBCM5N0012345', clientId: undefined, supplierId: 'sup-5', conteneurId: 'con-7', passeportId: undefined, status: 'ordered',    purchasePrice: 27000, transportCost: 2300, theoreticalRate: 134, passeportCost: 0,      localFees: 200000, totalCost: 4140000,  sellingPrice: undefined,    photoUrl: photo('1568605114967-8130f3a36994'), color: 'Rouge',  transmission: 'automatic', paymentStatus: null,        amountPaid: 0,        orderDate: '2026-03-08' },
  { id: 'veh-13', brand: 'Volkswagen', model: 'Touareg',    year: 2024, vin: 'WVGZZZCRZNW012345', clientId: 'cli-2', supplierId: 'sup-5', conteneurId: 'con-8', passeportId: 'pas-9', status: 'ordered',    purchasePrice: 52000, transportCost: 2200, theoreticalRate: 134, passeportCost: 50000,  localFees: 360000, totalCost: 7728000,  sellingPrice: 8400000,  photoUrl: photo('1606664515524-ed2f786a0bd6'), color: 'Gris',   transmission: 'automatic', paymentStatus: 'versement', amountPaid: 2000000,  orderDate: '2026-03-10' },
  { id: 'veh-14', brand: 'Ford',     model: 'Explorer',     year: 2024, vin: '1FM5K8D87NG012345', clientId: 'cli-4', supplierId: 'sup-5', conteneurId: 'con-8', passeportId: 'pas-10', status: 'ordered',   purchasePrice: 41000, transportCost: 2200, theoreticalRate: 134, passeportCost: 50000,  localFees: 290000, totalCost: 6160000,  sellingPrice: 6650000,  photoUrl: photo('1552519507-da3b142c6e3d'), color: 'Noir',   transmission: 'automatic', paymentStatus: 'versement', amountPaid: 1500000,  orderDate: '2026-03-10' },
  { id: 'veh-15', brand: 'Honda',    model: 'CR-V',         year: 2024, vin: '7FARW2H80NE012345', clientId: undefined, supplierId: 'sup-1', conteneurId: 'con-2', passeportId: undefined, status: 'in_transit', purchasePrice: 29000, transportCost: 2400, theoreticalRate: 134, passeportCost: 0,      localFees: 220000, totalCost: 4426000,  sellingPrice: undefined,    photoUrl: photo('1568605114967-8130f3a36994'), color: 'Blanc',  transmission: 'automatic', paymentStatus: null,        amountPaid: 0,        orderDate: '2026-02-01' },
];

export const seedPayments: Payment[] = [
  // ---- Dossier dos-1 (Guangzhou) — versements multiples → taux moyen pondéré ~134.40
  { id: 'pay-1a', date: '2026-01-12', amount: 60000, currency: 'USD', exchangeRate: 134.20, type: 'supplier_payment', reference: 'GUANGZHOU-2026-001 / acompte 1', status: 'completed', supplierId: 'sup-1', dossierId: 'dos-1' },
  { id: 'pay-1b', date: '2026-02-08', amount: 50000, currency: 'USD', exchangeRate: 134.50, type: 'supplier_payment', reference: 'GUANGZHOU-2026-001 / acompte 2', status: 'completed', supplierId: 'sup-1', dossierId: 'dos-1' },
  { id: 'pay-1c', date: '2026-03-22', amount: 40000, currency: 'USD', exchangeRate: 134.60, type: 'supplier_payment', reference: 'GUANGZHOU-2026-001 / acompte 3', status: 'completed', supplierId: 'sup-1', dossierId: 'dos-1' },
  { id: 'pay-2',  date: '2026-04-12', amount: 320000, currency: 'DZD', exchangeRate: 134.5, type: 'fees',             reference: 'Frais douane CONT MSCU-1234567', status: 'completed' },
  // ---- Dossier dos-2 (Shanghai)
  { id: 'pay-3a', date: '2026-01-22', amount: 75000, currency: 'USD', exchangeRate: 134.10, type: 'supplier_payment', reference: 'SHANGHAI-2026-001 / acompte 1', status: 'completed', supplierId: 'sup-2', dossierId: 'dos-2' },
  { id: 'pay-3b', date: '2026-02-25', amount: 70000, currency: 'USD', exchangeRate: 134.40, type: 'supplier_payment', reference: 'SHANGHAI-2026-001 / acompte 2', status: 'completed', supplierId: 'sup-2', dossierId: 'dos-2' },
  { id: 'pay-4',  date: '2026-04-05', amount: 7200000,currency: 'DZD', exchangeRate: 134.5, type: 'client_payment',   reference: 'Règlement Toyota Land Cruiser', status: 'completed', clientId: 'cli-1' },
  // ---- Dossier dos-4 (Beijing) → SOLDÉ
  { id: 'pay-5a', date: '2026-02-12', amount: 35000, currency: 'USD', exchangeRate: 133.90, type: 'supplier_payment', reference: 'BEIJING-2026-001 / acompte 1', status: 'completed', supplierId: 'sup-4', dossierId: 'dos-4' },
  { id: 'pay-5b', date: '2026-03-18', amount: 25000, currency: 'USD', exchangeRate: 134.10, type: 'supplier_payment', reference: 'BEIJING-2026-001 / solde',     status: 'completed', supplierId: 'sup-4', dossierId: 'dos-4' },
  { id: 'pay-6',  date: '2026-03-28', amount: 5050000,currency: 'DZD', exchangeRate: 134.5, type: 'client_payment',   reference: 'Règlement Kia Sorento',         status: 'completed', clientId: 'cli-3' },
  { id: 'pay-7',  date: '2026-03-22', amount: 4750000,currency: 'DZD', exchangeRate: 134.5, type: 'client_payment',   reference: 'Règlement Hyundai Tucson',      status: 'completed', clientId: 'cli-1' },
  { id: 'pay-8',  date: '2026-03-18', amount: 4200,   currency: 'USD', exchangeRate: 134.5, type: 'transport',        reference: 'Transport CONT MSCU-1234567',   status: 'completed' },
  // ---- Dossier dos-3 (Shenzhen)
  { id: 'pay-9',  date: '2026-03-10', amount: 70000, currency: 'USD', exchangeRate: 133.90, type: 'supplier_payment', reference: 'SHENZHEN-2026-001 / acompte 1', status: 'completed', supplierId: 'sup-3', dossierId: 'dos-3' },
  { id: 'pay-10', date: '2026-03-05', amount: 12500000,currency:'DZD', exchangeRate: 134.5, type: 'client_payment',   reference: 'Règlement Porsche Cayenne',     status: 'completed', clientId: 'cli-5' },
  { id: 'pay-11', date: '2026-02-28', amount: 3800,   currency: 'USD', exchangeRate: 134.0, type: 'transport',        reference: 'Transport CONT MSCU-1234568',   status: 'pending'   },
  { id: 'pay-12', date: '2026-02-20', amount: 410000, currency: 'DZD', exchangeRate: 134.5, type: 'fees',             reference: 'Frais portuaires GLE 450',      status: 'completed' },
  // ---- Dossier dos-5 (Tianjin) → un acompte
  { id: 'pay-13', date: '2026-03-12', amount: 50000, currency: 'USD', exchangeRate: 134.30, type: 'supplier_payment', reference: 'TIANJIN-2026-001 / acompte 1', status: 'completed', supplierId: 'sup-5', dossierId: 'dos-5' },
];

export const seedCaisseEntries: CaisseEntry[] = [
  { id: 'cai-1', type: 'entree',     montant: 7200000, date: '2026-04-15', description: 'Versement client Benali',         reference: 'CLI-1', clientId: 'cli-1', paymentMethod: 'versement', createdAt: '2026-04-15' },
  { id: 'cai-2', type: 'charge',     montant: 320000,  date: '2026-04-12', description: 'Frais de douane CONT MSCU-1234567', paymentMethod: 'versement', createdAt: '2026-04-12' },
  { id: 'cai-3', type: 'vente_auto', montant: 5050000, date: '2026-04-05', description: 'Vente Kia Sorento',               vehicleId: 'veh-10', clientId: 'cli-3', prixVente: 5050000, prixRevient: 4590000, benefice: 460000, paymentMethod: 'versement', createdAt: '2026-04-05' },
  { id: 'cai-4', type: 'vente_auto', montant: 4750000, date: '2026-04-02', description: 'Vente Hyundai Tucson',            vehicleId: 'veh-9',  clientId: 'cli-1', prixVente: 4750000, prixRevient: 4310000, benefice: 440000, paymentMethod: 'versement', createdAt: '2026-04-02' },
  { id: 'cai-5', type: 'charge',     montant: 180000,  date: '2026-03-30', description: 'Loyer entrepôt Mars',             paymentMethod: 'virement',  createdAt: '2026-03-30' },
  { id: 'cai-6', type: 'entree',     montant: 12500000,date: '2026-03-05', description: 'Versement client Bensalem',       reference: 'CLI-5', clientId: 'cli-5', paymentMethod: 'virement',  createdAt: '2026-03-05' },
  { id: 'cai-7', type: 'charge',     montant: 95000,   date: '2026-02-25', description: 'Salaires équipe',                 paymentMethod: 'virement',  createdAt: '2026-02-25' },
  { id: 'cai-8', type: 'entree',     montant: 3000000, date: '2026-02-18', description: 'Acompte client Mansouri',         reference: 'CLI-3', clientId: 'cli-3', paymentMethod: 'versement', createdAt: '2026-02-18' },
];

export const seedSales: Sale[] = [
  { id: 'sal-1', clientId: 'cli-1', date: '2026-04-02', totalSellingPrice: 4750000,  totalCost: 4310000,  totalProfit: 440000,  amountPaid: 4750000,  debt: 0,      carriedDebt: 0, vehicles: [], createdAt: '2026-04-02', updatedAt: '2026-04-02' },
  { id: 'sal-2', clientId: 'cli-3', date: '2026-04-05', totalSellingPrice: 5050000,  totalCost: 4590000,  totalProfit: 460000,  amountPaid: 5050000,  debt: 0,      carriedDebt: 0, vehicles: [], createdAt: '2026-04-05', updatedAt: '2026-04-05' },
  { id: 'sal-3', clientId: 'cli-5', date: '2026-03-05', totalSellingPrice: 12500000, totalCost: 11460000, totalProfit: 1040000, amountPaid: 12500000, debt: 0,      carriedDebt: 0, vehicles: [], createdAt: '2026-03-05', updatedAt: '2026-03-05' },
  { id: 'sal-4', clientId: 'cli-2', date: '2026-03-22', totalSellingPrice: 9800000,  totalCost: 9148000,  totalProfit: 652000,  amountPaid: 4500000,  debt: 5300000,carriedDebt: 0, vehicles: [], createdAt: '2026-03-22', updatedAt: '2026-03-22' },
];

export const seedCarModels: CarModel[] = [
  { id: 'mdl-1', brand: 'Toyota',     model: 'Land Cruiser', createdAt: '2025-12-01' },
  { id: 'mdl-2', brand: 'Toyota',     model: 'Hilux',        createdAt: '2025-12-01' },
  { id: 'mdl-3', brand: 'Mercedes',   model: 'GLE 450',      createdAt: '2025-12-01' },
  { id: 'mdl-4', brand: 'BMW',        model: 'X5 M50i',      createdAt: '2025-12-01' },
  { id: 'mdl-5', brand: 'Audi',       model: 'Q8',           createdAt: '2025-12-01' },
  { id: 'mdl-6', brand: 'Porsche',    model: 'Cayenne',      createdAt: '2025-12-01' },
  { id: 'mdl-7', brand: 'Lexus',      model: 'LX 600',       createdAt: '2025-12-01' },
  { id: 'mdl-8', brand: 'Range Rover',model: 'Vogue',        createdAt: '2025-12-01' },
  { id: 'mdl-9', brand: 'Hyundai',    model: 'Tucson',       createdAt: '2025-12-01' },
  { id: 'mdl-10',brand: 'Kia',        model: 'Sorento',      createdAt: '2025-12-01' },
  { id: 'mdl-11',brand: 'Nissan',     model: 'Patrol',       createdAt: '2025-12-01' },
  { id: 'mdl-12',brand: 'Mazda',      model: 'CX-5',         createdAt: '2025-12-01' },
  { id: 'mdl-13',brand: 'Volkswagen', model: 'Touareg',      createdAt: '2025-12-01' },
  { id: 'mdl-14',brand: 'Ford',       model: 'Explorer',     createdAt: '2025-12-01' },
  { id: 'mdl-15',brand: 'Honda',      model: 'CR-V',         createdAt: '2025-12-01' },
];

export const seedZakatRecords: ZakatRecord[] = [
  { id: 'zak-1', year: 2025, assetsTotal: 48000000, debtsTotal: 8500000, zakatBase: 39500000, zakatAmount: 987500, amountPaid: 987500, notes: 'Zakat 2025 acquittée', createdAt: '2025-12-31' },
];

export const seedVehiclePayments: VehiclePayment[] = [
  { id: 'vp-1', vehicleId: 'veh-1', date: '2026-01-12', amountUSD: 25000, exchangeRate: 134.5, createdAt: '2026-01-12' },
  { id: 'vp-2', vehicleId: 'veh-1', date: '2026-02-18', amountUSD: 20000, exchangeRate: 134.5, createdAt: '2026-02-18' },
  { id: 'vp-3', vehicleId: 'veh-2', date: '2026-01-12', amountUSD: 30000, exchangeRate: 134.2, createdAt: '2026-01-12' },
  { id: 'vp-4', vehicleId: 'veh-4', date: '2026-01-22', amountUSD: 55000, exchangeRate: 134.5, createdAt: '2026-01-22' },
  { id: 'vp-5', vehicleId: 'veh-5', date: '2026-01-22', amountUSD: 40000, exchangeRate: 134.5, createdAt: '2026-01-22' },
  { id: 'vp-6', vehicleId: 'veh-9', date: '2026-02-15', amountUSD: 28000, exchangeRate: 134.0, createdAt: '2026-02-15' },
];

export const seedVehicleCharges: VehicleCharge[] = [
  { id: 'vc-1', vehicleId: 'veh-1', label: 'Charges Transit (DZD)', amount: 120000, createdAt: '2026-02-22' },
  { id: 'vc-2', vehicleId: 'veh-1', label: 'Carte grise',           amount: 45000,  createdAt: '2026-03-01' },
  { id: 'vc-3', vehicleId: 'veh-2', label: 'Charges Transit (DZD)', amount: 150000, createdAt: '2026-02-22' },
  { id: 'vc-4', vehicleId: 'veh-4', label: 'Charges Transit (DZD)', amount: 140000, createdAt: '2026-03-04' },
  { id: 'vc-5', vehicleId: 'veh-5', label: 'Charges Transit (DZD)', amount: 180000, createdAt: '2026-03-04' },
  { id: 'vc-6', vehicleId: 'veh-9', label: 'Charges Transit (DZD)', amount: 90000,  createdAt: '2026-03-28' },
];

export const seedCaisseBalance = 8200000;
export const seedBanqueBalance = 18500000;