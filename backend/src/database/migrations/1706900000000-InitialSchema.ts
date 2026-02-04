import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1706900000000 implements MigrationInterface {
  name = 'InitialSchema1706900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('admin', 'manager', 'user');
      CREATE TYPE "user_status_enum" AS ENUM ('active', 'inactive');
      CREATE TYPE "dossier_status_enum" AS ENUM ('en_cours', 'termine', 'annule');
      CREATE TYPE "conteneur_type_enum" AS ENUM ('20ft', '40ft', '40ft_hc');
      CREATE TYPE "conteneur_status_enum" AS ENUM ('en_chargement', 'en_transit', 'arrive', 'dedouane');
      CREATE TYPE "vehicle_status_enum" AS ENUM ('ordered', 'in_transit', 'arrived', 'sold');
      CREATE TYPE "payment_currency_enum" AS ENUM ('USD', 'DZD');
      CREATE TYPE "payment_type_enum" AS ENUM ('supplier_payment', 'client_payment', 'transport', 'fees');
      CREATE TYPE "payment_status_enum" AS ENUM ('completed', 'pending');
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "email" varchar UNIQUE NOT NULL,
        "password" varchar NOT NULL,
        "role" "user_role_enum" DEFAULT 'user',
        "status" "user_status_enum" DEFAULT 'active',
        "lastActive" timestamp,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // Create suppliers table
    await queryRunner.query(`
      CREATE TABLE "suppliers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "location" varchar NOT NULL,
        "creditBalance" decimal(12,2) DEFAULT 0,
        "totalPaid" decimal(12,2) DEFAULT 0,
        "remainingDebt" decimal(12,2) DEFAULT 0,
        "vehiclesSupplied" int DEFAULT 0,
        "rating" decimal(3,1) DEFAULT 0,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // Create dossiers table
    await queryRunner.query(`
      CREATE TABLE "dossiers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "reference" varchar UNIQUE NOT NULL,
        "supplierId" uuid NOT NULL REFERENCES "suppliers"("id") ON DELETE CASCADE,
        "dateCreation" date NOT NULL,
        "status" "dossier_status_enum" DEFAULT 'en_cours',
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // Create conteneurs table
    await queryRunner.query(`
      CREATE TABLE "conteneurs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "numero" varchar UNIQUE NOT NULL,
        "dossierId" uuid NOT NULL REFERENCES "dossiers"("id") ON DELETE CASCADE,
        "type" "conteneur_type_enum" DEFAULT '40ft',
        "status" "conteneur_status_enum" DEFAULT 'en_chargement',
        "coutTransport" decimal(12,2) DEFAULT 0,
        "dateDepart" date,
        "dateArrivee" date,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // Create clients table
    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "nom" varchar NOT NULL,
        "prenom" varchar NOT NULL,
        "telephone" varchar NOT NULL,
        "adresse" varchar,
        "email" varchar,
        "company" varchar,
        "pourcentageBenefice" decimal(5,2) DEFAULT 0,
        "prixVente" decimal(14,2) DEFAULT 0,
        "coutRevient" decimal(14,2) DEFAULT 0,
        "detteBenefice" decimal(14,2) DEFAULT 0,
        "paye" boolean DEFAULT false,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // Create vehicles table
    await queryRunner.query(`
      CREATE TABLE "vehicles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "brand" varchar NOT NULL,
        "model" varchar NOT NULL,
        "year" int NOT NULL,
        "vin" varchar UNIQUE NOT NULL,
        "clientId" uuid REFERENCES "clients"("id") ON DELETE SET NULL,
        "supplierId" uuid NOT NULL REFERENCES "suppliers"("id") ON DELETE CASCADE,
        "conteneurId" uuid NOT NULL REFERENCES "conteneurs"("id") ON DELETE CASCADE,
        "status" "vehicle_status_enum" DEFAULT 'ordered',
        "purchasePrice" decimal(12,2) NOT NULL,
        "transportCost" decimal(12,2) DEFAULT 0,
        "localFees" decimal(14,2) DEFAULT 0,
        "totalCost" decimal(14,2) DEFAULT 0,
        "sellingPrice" decimal(14,2),
        "orderDate" date NOT NULL,
        "arrivalDate" date,
        "soldDate" date,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // Create passeports table
    await queryRunner.query(`
      CREATE TABLE "passeports" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "nom" varchar NOT NULL,
        "prenom" varchar NOT NULL,
        "telephone" varchar NOT NULL,
        "adresse" varchar,
        "numeroPasseport" varchar UNIQUE NOT NULL,
        "pdfPasseport" varchar,
        "montantDu" decimal(12,2) DEFAULT 0,
        "paye" boolean DEFAULT false,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // Create payments table
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "date" date NOT NULL,
        "amount" decimal(14,2) NOT NULL,
        "currency" "payment_currency_enum" DEFAULT 'USD',
        "exchangeRate" decimal(10,2) DEFAULT 134.5,
        "type" "payment_type_enum" NOT NULL,
        "reference" varchar NOT NULL,
        "status" "payment_status_enum" DEFAULT 'pending',
        "supplierId" uuid REFERENCES "suppliers"("id") ON DELETE SET NULL,
        "clientId" uuid REFERENCES "clients"("id") ON DELETE SET NULL,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users"("email")`);
    await queryRunner.query(`CREATE INDEX "idx_vehicles_status" ON "vehicles"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_vehicles_conteneur" ON "vehicles"("conteneurId")`);
    await queryRunner.query(`CREATE INDEX "idx_conteneurs_dossier" ON "conteneurs"("dossierId")`);
    await queryRunner.query(`CREATE INDEX "idx_dossiers_supplier" ON "dossiers"("supplierId")`);
    await queryRunner.query(`CREATE INDEX "idx_payments_date" ON "payments"("date")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "passeports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vehicles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clients"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "conteneurs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dossiers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "suppliers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "payment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_currency_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "vehicle_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "conteneur_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "conteneur_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "dossier_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
