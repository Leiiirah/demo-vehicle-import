import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDefaultTheoreticalRate1708500000000 implements MigrationInterface {
  name = 'RemoveDefaultTheoreticalRate1708500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vehicles" ALTER COLUMN "theoreticalRate" SET DEFAULT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vehicles" ALTER COLUMN "theoreticalRate" SET DEFAULT 134.5`);
  }
}
