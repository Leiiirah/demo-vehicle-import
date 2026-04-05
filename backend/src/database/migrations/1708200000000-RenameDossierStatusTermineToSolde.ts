import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameDossierStatusTermineToSolde1708200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new value to enum
    await queryRunner.query(`ALTER TYPE dossiers_status_enum ADD VALUE IF NOT EXISTS 'solde'`);

    // Update existing rows
    await queryRunner.query(`UPDATE dossiers SET status = 'solde' WHERE status = 'termine'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE dossiers SET status = 'termine' WHERE status = 'solde'`);
  }
}
