import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasseportNin1707600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "passeports" ADD COLUMN IF NOT EXISTS "nin" varchar`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "passeports" DROP COLUMN IF EXISTS "nin"`);
  }
}
