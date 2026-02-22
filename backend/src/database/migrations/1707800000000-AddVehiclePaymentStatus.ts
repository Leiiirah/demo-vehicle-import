import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVehiclePaymentStatus1707800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "vehicle_payment_status_enum" AS ENUM('versement', 'solde')`,
    );

    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD COLUMN "paymentStatus" "vehicle_payment_status_enum" NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "vehicles" ADD COLUMN "amountPaid" decimal(14,2) NOT NULL DEFAULT 0`,
    );

    // Existing sold vehicles with a client should be marked as 'solde'
    await queryRunner.query(
      `UPDATE "vehicles" SET "paymentStatus" = 'solde', "amountPaid" = COALESCE("sellingPrice", 0) WHERE "clientId" IS NOT NULL AND "status" = 'sold'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "amountPaid"`);
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "paymentStatus"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "vehicle_payment_status_enum"`);
  }
}

