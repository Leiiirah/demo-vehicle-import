import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameDossierStatusTermineToSolde1708200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Must commit the transaction first, then add enum value outside transaction
    await queryRunner.commitTransaction();

    // Add new enum value outside of a transaction
    await queryRunner.query(`ALTER TYPE "dossier_status_enum" ADD VALUE IF NOT EXISTS 'solde'`);

    // Start a new transaction for the UPDATE
    await queryRunner.startTransaction();

    // Now update existing rows
    await queryRunner.query(`UPDATE "dossiers" SET "status" = 'solde' WHERE "status" = 'termine'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "dossiers" SET "status" = 'termine' WHERE "status" = 'solde'`);
  }
}
