import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSalesTable1708600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "sales" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "clientId" uuid NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
        "date" date NOT NULL DEFAULT CURRENT_DATE,
        "totalSellingPrice" decimal(14,2) NOT NULL DEFAULT 0,
        "totalCost" decimal(14,2) NOT NULL DEFAULT 0,
        "totalProfit" decimal(14,2) NOT NULL DEFAULT 0,
        "amountPaid" decimal(14,2) NOT NULL DEFAULT 0,
        "debt" decimal(14,2) NOT NULL DEFAULT 0,
        "carriedDebt" decimal(14,2) NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Add saleId column to vehicles
    await queryRunner.query(`
      ALTER TABLE "vehicles" ADD COLUMN "saleId" uuid REFERENCES "sales"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN "saleId"`);
    await queryRunner.query(`DROP TABLE "sales"`);
  }
}
