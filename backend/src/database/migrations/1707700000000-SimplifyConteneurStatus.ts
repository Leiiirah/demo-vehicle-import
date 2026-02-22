import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimplifyConteneurStatus1707700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update existing data to new statuses
    await queryRunner.query(`
      UPDATE "conteneurs" SET "status" = 'en_chargement' WHERE "status" IN ('en_chargement', 'en_transit');
    `);
    await queryRunner.query(`
      UPDATE "conteneurs" SET "status" = 'arrive' WHERE "status" IN ('arrive', 'dedouane');
    `);

    // Alter the enum type
    await queryRunner.query(`ALTER TYPE "conteneur_status_enum" RENAME TO "conteneur_status_enum_old"`);
    await queryRunner.query(`CREATE TYPE "conteneur_status_enum" AS ENUM ('charge', 'decharge')`);
    await queryRunner.query(`
      ALTER TABLE "conteneurs" ALTER COLUMN "status" TYPE "conteneur_status_enum" 
      USING CASE 
        WHEN "status"::text IN ('en_chargement', 'en_transit') THEN 'charge'::conteneur_status_enum
        WHEN "status"::text IN ('arrive', 'dedouane') THEN 'decharge'::conteneur_status_enum
        ELSE 'charge'::conteneur_status_enum
      END
    `);
    await queryRunner.query(`ALTER TABLE "conteneurs" ALTER COLUMN "status" SET DEFAULT 'charge'`);
    await queryRunner.query(`DROP TYPE "conteneur_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "conteneur_status_enum" RENAME TO "conteneur_status_enum_old"`);
    await queryRunner.query(`CREATE TYPE "conteneur_status_enum" AS ENUM ('en_chargement', 'en_transit', 'arrive', 'dedouane')`);
    await queryRunner.query(`
      ALTER TABLE "conteneurs" ALTER COLUMN "status" TYPE "conteneur_status_enum" 
      USING CASE 
        WHEN "status"::text = 'charge' THEN 'en_chargement'::conteneur_status_enum
        WHEN "status"::text = 'decharge' THEN 'arrive'::conteneur_status_enum
        ELSE 'en_chargement'::conteneur_status_enum
      END
    `);
    await queryRunner.query(`ALTER TABLE "conteneurs" ALTER COLUMN "status" SET DEFAULT 'en_chargement'`);
    await queryRunner.query(`DROP TYPE "conteneur_status_enum_old"`);
  }
}
