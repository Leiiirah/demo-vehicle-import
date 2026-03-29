import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCarModels1708000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "car_models" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "brand" varchar NOT NULL,
        "model" varchar NOT NULL,
        "imageUrl" varchar NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE ("brand", "model")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "car_models"`);
  }
}
