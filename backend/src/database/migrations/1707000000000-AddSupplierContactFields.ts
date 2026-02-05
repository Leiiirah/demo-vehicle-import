import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupplierContactFields1707000000000 implements MigrationInterface {
  name = 'AddSupplierContactFields1707000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "contactName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "contactEmail" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "contactPhone" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "contactPhone"`);
    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "contactEmail"`);
    await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN IF EXISTS "contactName"`);
  }
}
