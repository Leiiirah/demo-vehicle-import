// Mock data for the vehicle import management platform

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  client: string;
  supplier: string;
  containerId: string;
  status: 'ordered' | 'in_transit' | 'arrived' | 'sold';
  purchasePrice: number;
  transportCost: number;
  localFees: number;
  totalCost: number;
  sellingPrice: number;
  profit: number;
  margin: number;
  orderDate: string;
  arrivalDate?: string;
  soldDate?: string;
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
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  vehiclesImported: number;
  totalProfit: number;
  marginPercentage: number;
  status: 'active' | 'inactive';
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
}

export const exchangeRate = {
  USD_DZD: 134.50,
  lastUpdated: '2026-02-02 09:30',
};

export const kpiData = {
  totalInvested: 2450000,
  totalProfit: 385000,
  outstandingDebts: 125000,
  vehiclesInTransit: 12,
  vehiclesArrived: 8,
  vehiclesSold: 45,
  totalVehicles: 65,
};

export const vehicles: Vehicle[] = [
  {
    id: 'VH001',
    brand: 'Toyota',
    model: 'Land Cruiser',
    year: 2024,
    vin: 'JTMWF4DV4P5012345',
    client: 'Ahmed Benali',
    supplier: 'Guangzhou Auto Export',
    containerId: 'CONT-2024-001',
    status: 'in_transit',
    purchasePrice: 45000,
    transportCost: 2500,
    localFees: 350000,
    totalCost: 6738500,
    sellingPrice: 7200000,
    profit: 461500,
    margin: 6.8,
    orderDate: '2026-01-15',
  },
  {
    id: 'VH002',
    brand: 'Mercedes',
    model: 'GLE 450',
    year: 2024,
    vin: 'W1N2534861A123456',
    client: 'Karim Hadj',
    supplier: 'Shanghai Motors Ltd',
    containerId: 'CONT-2024-001',
    status: 'arrived',
    purchasePrice: 62000,
    transportCost: 2800,
    localFees: 420000,
    totalCost: 9145600,
    sellingPrice: 9800000,
    profit: 654400,
    margin: 7.2,
    orderDate: '2026-01-10',
    arrivalDate: '2026-01-28',
  },
  {
    id: 'VH003',
    brand: 'BMW',
    model: 'X5 M50i',
    year: 2024,
    vin: '5UXCR6C51N9A12345',
    client: 'Youcef Mansouri',
    supplier: 'Guangzhou Auto Export',
    containerId: 'CONT-2024-002',
    status: 'sold',
    purchasePrice: 58000,
    transportCost: 2600,
    localFees: 380000,
    totalCost: 8530700,
    sellingPrice: 9200000,
    profit: 669300,
    margin: 7.8,
    orderDate: '2025-12-20',
    arrivalDate: '2026-01-15',
    soldDate: '2026-01-25',
  },
  {
    id: 'VH004',
    brand: 'Audi',
    model: 'Q8',
    year: 2024,
    vin: 'WAUZZZF18PN012345',
    client: 'Fatima Zerrouki',
    supplier: 'Shenzhen Auto Hub',
    containerId: 'CONT-2024-003',
    status: 'ordered',
    purchasePrice: 55000,
    transportCost: 2700,
    localFees: 390000,
    totalCost: 8151150,
    sellingPrice: 8750000,
    profit: 598850,
    margin: 7.4,
    orderDate: '2026-02-01',
  },
  {
    id: 'VH005',
    brand: 'Porsche',
    model: 'Cayenne',
    year: 2024,
    vin: 'WP1AB2A53PLB12345',
    client: 'Omar Bensalem',
    supplier: 'Shanghai Motors Ltd',
    containerId: 'CONT-2024-002',
    status: 'in_transit',
    purchasePrice: 78000,
    transportCost: 3200,
    localFees: 520000,
    totalCost: 11451400,
    sellingPrice: 12300000,
    profit: 848600,
    margin: 7.4,
    orderDate: '2026-01-18',
  },
];

export const suppliers: Supplier[] = [
  {
    id: 'SUP001',
    name: 'Guangzhou Auto Export',
    location: 'Guangzhou, China',
    creditBalance: 45000,
    totalPaid: 380000,
    remainingDebt: 45000,
    vehiclesSupplied: 28,
    rating: 4.8,
  },
  {
    id: 'SUP002',
    name: 'Shanghai Motors Ltd',
    location: 'Shanghai, China',
    creditBalance: 32000,
    totalPaid: 520000,
    remainingDebt: 32000,
    vehiclesSupplied: 35,
    rating: 4.9,
  },
  {
    id: 'SUP003',
    name: 'Shenzhen Auto Hub',
    location: 'Shenzhen, China',
    creditBalance: 28000,
    totalPaid: 290000,
    remainingDebt: 28000,
    vehiclesSupplied: 18,
    rating: 4.6,
  },
];

export const clients: Client[] = [
  {
    id: 'CL001',
    name: 'Ahmed Benali',
    company: 'Benali Auto Import',
    email: 'ahmed@benaliauto.dz',
    phone: '+213 555 123 456',
    vehiclesImported: 12,
    totalProfit: 1850000,
    marginPercentage: 7.2,
    status: 'active',
  },
  {
    id: 'CL002',
    name: 'Karim Hadj',
    company: 'Hadj Motors',
    email: 'karim@hadjmotors.dz',
    phone: '+213 555 234 567',
    vehiclesImported: 8,
    totalProfit: 1250000,
    marginPercentage: 6.8,
    status: 'active',
  },
  {
    id: 'CL003',
    name: 'Youcef Mansouri',
    company: 'Mansouri Premium Cars',
    email: 'youcef@mansouricars.dz',
    phone: '+213 555 345 678',
    vehiclesImported: 15,
    totalProfit: 2100000,
    marginPercentage: 7.5,
    status: 'active',
  },
  {
    id: 'CL004',
    name: 'Fatima Zerrouki',
    company: 'FZ Auto',
    email: 'fatima@fzauto.dz',
    phone: '+213 555 456 789',
    vehiclesImported: 6,
    totalProfit: 920000,
    marginPercentage: 6.5,
    status: 'active',
  },
];

export const recentPayments: Payment[] = [
  {
    id: 'PAY001',
    date: '2026-02-01',
    amount: 45000,
    currency: 'USD',
    exchangeRate: 134.50,
    type: 'supplier_payment',
    reference: 'Guangzhou Auto Export - VH001',
    status: 'completed',
  },
  {
    id: 'PAY002',
    date: '2026-01-30',
    amount: 350000,
    currency: 'DZD',
    exchangeRate: 134.50,
    type: 'fees',
    reference: 'Customs clearance - CONT-2024-001',
    status: 'completed',
  },
  {
    id: 'PAY003',
    date: '2026-01-28',
    amount: 62000,
    currency: 'USD',
    exchangeRate: 133.80,
    type: 'supplier_payment',
    reference: 'Shanghai Motors Ltd - VH002',
    status: 'completed',
  },
];

export const profitHistory = [
  { month: 'Sep', profit: 280000 },
  { month: 'Oct', profit: 350000 },
  { month: 'Nov', profit: 420000 },
  { month: 'Dec', profit: 380000 },
  { month: 'Jan', profit: 520000 },
  { month: 'Feb', profit: 385000 },
];

export const vehiclesByStatus = [
  { name: 'Ordered', value: 8, color: 'hsl(217, 91%, 60%)' },
  { name: 'In Transit', value: 12, color: 'hsl(38, 92%, 50%)' },
  { name: 'Arrived', value: 8, color: 'hsl(142, 71%, 45%)' },
  { name: 'Sold', value: 45, color: 'hsl(215, 16%, 47%)' },
];

export const topVehicles = [
  { brand: 'Porsche', model: 'Cayenne', profit: 848600, margin: 7.4 },
  { brand: 'BMW', model: 'X5 M50i', profit: 669300, margin: 7.8 },
  { brand: 'Mercedes', model: 'GLE 450', profit: 654400, margin: 7.2 },
  { brand: 'Audi', model: 'Q8', profit: 598850, margin: 7.4 },
  { brand: 'Toyota', model: 'Land Cruiser', profit: 461500, margin: 6.8 },
];
