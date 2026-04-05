import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConteneurArriveeStatus1708300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "conteneur_status_enum" ADD VALUE IF NOT EXISTS 'arrivee' AFTER 'charge'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot remove enum values in PostgreSQL without recreating the type
  }
}
