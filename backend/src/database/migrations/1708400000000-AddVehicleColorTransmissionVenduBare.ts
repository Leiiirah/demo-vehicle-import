import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVehicleColorTransmissionVenduBare1708400000000 implements MigrationInterface {
  name = 'AddVehicleColorTransmissionVenduBare1708400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add color column
    await queryRunner.query(`ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "color" varchar`);

    // Add transmission column
    await queryRunner.query(`ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "transmission" varchar DEFAULT 'automatic'`);

    // Add vendu_bare to vehicle_status_enum
    await queryRunner.query(`ALTER TYPE "vehicle_status_enum" ADD VALUE IF NOT EXISTS 'vendu_bare'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "color"`);
    await queryRunner.query(`ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "transmission"`);
  }
}
