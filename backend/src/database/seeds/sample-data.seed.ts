import { DataSource } from 'typeorm';
import { Supplier } from '../../entities/supplier.entity';
import { Dossier, DossierStatus } from '../../entities/dossier.entity';
import { Conteneur, ConteneurType, ConteneurStatus } from '../../entities/conteneur.entity';
import { Vehicle, VehicleStatus } from '../../entities/vehicle.entity';
import { Client } from '../../entities/client.entity';
import { Passeport } from '../../entities/passeport.entity';
import { Payment, PaymentCurrency, PaymentType, PaymentStatus } from '../../entities/payment.entity';

export async function seedSampleData(dataSource: DataSource) {
  console.log('📦 Seeding sample data...');

  const supplierRepo = dataSource.getRepository(Supplier);
  const dossierRepo = dataSource.getRepository(Dossier);
  const conteneurRepo = dataSource.getRepository(Conteneur);
  const vehicleRepo = dataSource.getRepository(Vehicle);
  const clientRepo = dataSource.getRepository(Client);
  const passeportRepo = dataSource.getRepository(Passeport);
  const paymentRepo = dataSource.getRepository(Payment);

  // Check if data already exists
  const existingSuppliers = await supplierRepo.count();
  if (existingSuppliers > 0) {
    console.log('ℹ️  Sample data already exists, skipping');
    return;
  }

  // Create Suppliers
  const suppliers = await supplierRepo.save([
    {
      name: 'Guangzhou Auto Export',
      location: 'Guangzhou, China',
      creditBalance: 45000,
      totalPaid: 380000,
      remainingDebt: 45000,
      vehiclesSupplied: 28,
      rating: 4.8,
    },
    {
      name: 'Shanghai Motors Ltd',
      location: 'Shanghai, China',
      creditBalance: 32000,
      totalPaid: 520000,
      remainingDebt: 32000,
      vehiclesSupplied: 35,
      rating: 4.9,
    },
    {
      name: 'Shenzhen Auto Hub',
      location: 'Shenzhen, China',
      creditBalance: 28000,
      totalPaid: 290000,
      remainingDebt: 28000,
      vehiclesSupplied: 18,
      rating: 4.6,
    },
  ]);

  console.log(`✅ Created ${suppliers.length} suppliers`);

  // Create Dossiers
  const dossiers = await dossierRepo.save([
    {
      reference: 'DOS-2026-001',
      supplierId: suppliers[0].id,
      dateCreation: new Date('2026-01-10'),
      status: DossierStatus.EN_COURS,
    },
    {
      reference: 'DOS-2026-002',
      supplierId: suppliers[1].id,
      dateCreation: new Date('2026-01-15'),
      status: DossierStatus.EN_COURS,
    },
    {
      reference: 'DOS-2025-015',
      supplierId: suppliers[0].id,
      dateCreation: new Date('2025-12-20'),
      status: DossierStatus.TERMINE,
    },
  ]);

  console.log(`✅ Created ${dossiers.length} dossiers`);

  // Create Conteneurs
  const conteneurs = await conteneurRepo.save([
    {
      numero: 'CONT-2026-001',
      dossierId: dossiers[0].id,
      type: ConteneurType.FORTY_FT_HC,
      status: ConteneurStatus.EN_TRANSIT,
      coutTransport: 5300,
      dateDepart: new Date('2026-01-20'),
    },
    {
      numero: 'CONT-2026-002',
      dossierId: dossiers[1].id,
      type: ConteneurType.FORTY_FT,
      status: ConteneurStatus.EN_TRANSIT,
      coutTransport: 4800,
      dateDepart: new Date('2026-01-18'),
    },
    {
      numero: 'CONT-2025-012',
      dossierId: dossiers[2].id,
      type: ConteneurType.FORTY_FT_HC,
      status: ConteneurStatus.DEDOUANE,
      coutTransport: 5100,
      dateDepart: new Date('2025-12-25'),
      dateArrivee: new Date('2026-01-15'),
    },
  ]);

  console.log(`✅ Created ${conteneurs.length} conteneurs`);

  // Create Clients
  const clients = await clientRepo.save([
    {
      nom: 'Benali',
      prenom: 'Ahmed',
      telephone: '+213 555 123 456',
      email: 'ahmed@benaliauto.dz',
      company: 'Benali Auto Import',
      adresse: 'Alger, Algérie',
      pourcentageBenefice: 7.2,
    },
    {
      nom: 'Hadj',
      prenom: 'Karim',
      telephone: '+213 555 234 567',
      email: 'karim@hadjmotors.dz',
      company: 'Hadj Motors',
      adresse: 'Oran, Algérie',
      pourcentageBenefice: 6.8,
    },
    {
      nom: 'Mansouri',
      prenom: 'Youcef',
      telephone: '+213 555 345 678',
      email: 'youcef@mansouricars.dz',
      company: 'Mansouri Premium Cars',
      adresse: 'Constantine, Algérie',
      pourcentageBenefice: 7.5,
    },
    {
      nom: 'Zerrouki',
      prenom: 'Fatima',
      telephone: '+213 555 456 789',
      email: 'fatima@fzauto.dz',
      company: 'FZ Auto',
      adresse: 'Annaba, Algérie',
      pourcentageBenefice: 6.5,
    },
  ]);

  console.log(`✅ Created ${clients.length} clients`);

  // Create Vehicles
  const vehicles = await vehicleRepo.save([
    {
      brand: 'Toyota',
      model: 'Land Cruiser',
      year: 2024,
      vin: 'JTMWF4DV4P5012345',
      supplierId: suppliers[0].id,
      conteneurId: conteneurs[0].id,
      clientId: clients[0].id,
      status: VehicleStatus.IN_TRANSIT,
      purchasePrice: 45000,
      transportCost: 2650,
      localFees: 350000,
      totalCost: 6738500,
      orderDate: new Date('2026-01-15'),
    },
    {
      brand: 'Mercedes',
      model: 'GLE 450',
      year: 2024,
      vin: 'W1N2534861A123456',
      supplierId: suppliers[1].id,
      conteneurId: conteneurs[0].id,
      clientId: clients[1].id,
      status: VehicleStatus.ARRIVED,
      purchasePrice: 62000,
      transportCost: 2650,
      localFees: 420000,
      totalCost: 9145600,
      sellingPrice: 9800000,
      orderDate: new Date('2026-01-10'),
      arrivalDate: new Date('2026-01-28'),
    },
    {
      brand: 'BMW',
      model: 'X5 M50i',
      year: 2024,
      vin: '5UXCR6C51N9A12345',
      supplierId: suppliers[0].id,
      conteneurId: conteneurs[2].id,
      clientId: clients[2].id,
      status: VehicleStatus.SOLD,
      purchasePrice: 58000,
      transportCost: 2550,
      localFees: 380000,
      totalCost: 8530700,
      sellingPrice: 9200000,
      orderDate: new Date('2025-12-20'),
      arrivalDate: new Date('2026-01-15'),
      soldDate: new Date('2026-01-25'),
    },
    {
      brand: 'Audi',
      model: 'Q8',
      year: 2024,
      vin: 'WAUZZZF18PN012345',
      supplierId: suppliers[2].id,
      conteneurId: conteneurs[1].id,
      clientId: clients[3].id,
      status: VehicleStatus.ORDERED,
      purchasePrice: 55000,
      transportCost: 2400,
      localFees: 390000,
      totalCost: 8151150,
      orderDate: new Date('2026-02-01'),
    },
    {
      brand: 'Porsche',
      model: 'Cayenne',
      year: 2024,
      vin: 'WP1AB2A53PLB12345',
      supplierId: suppliers[1].id,
      conteneurId: conteneurs[1].id,
      status: VehicleStatus.IN_TRANSIT,
      purchasePrice: 78000,
      transportCost: 2400,
      localFees: 520000,
      totalCost: 11451400,
      orderDate: new Date('2026-01-18'),
    },
  ]);

  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Create Passeports
  const passeports = await passeportRepo.save([
    {
      nom: 'Boudiaf',
      prenom: 'Mohamed',
      telephone: '+213 555 111 222',
      adresse: 'Alger, Algérie',
      numeroPasseport: 'ALG2024001234',
      montantDu: 15000,
      paye: false,
    },
    {
      nom: 'Kaci',
      prenom: 'Samira',
      telephone: '+213 555 333 444',
      adresse: 'Oran, Algérie',
      numeroPasseport: 'ALG2024005678',
      montantDu: 12000,
      paye: true,
    },
    {
      nom: 'Taleb',
      prenom: 'Omar',
      telephone: '+213 555 555 666',
      adresse: 'Constantine, Algérie',
      numeroPasseport: 'ALG2024009012',
      montantDu: 18000,
      paye: false,
    },
  ]);

  console.log(`✅ Created ${passeports.length} passeports`);

  // Create Payments
  const payments = await paymentRepo.save([
    {
      date: new Date('2026-02-01'),
      amount: 45000,
      currency: PaymentCurrency.USD,
      exchangeRate: 134.5,
      type: PaymentType.SUPPLIER_PAYMENT,
      reference: 'Guangzhou Auto Export - VH001',
      status: PaymentStatus.COMPLETED,
      supplierId: suppliers[0].id,
    },
    {
      date: new Date('2026-01-30'),
      amount: 350000,
      currency: PaymentCurrency.DZD,
      exchangeRate: 134.5,
      type: PaymentType.FEES,
      reference: 'Customs clearance - CONT-2024-001',
      status: PaymentStatus.COMPLETED,
    },
    {
      date: new Date('2026-01-28'),
      amount: 62000,
      currency: PaymentCurrency.USD,
      exchangeRate: 133.8,
      type: PaymentType.SUPPLIER_PAYMENT,
      reference: 'Shanghai Motors Ltd - VH002',
      status: PaymentStatus.COMPLETED,
      supplierId: suppliers[1].id,
    },
  ]);

  console.log(`✅ Created ${payments.length} payments`);

  console.log('✅ Sample data seeding completed');
}
