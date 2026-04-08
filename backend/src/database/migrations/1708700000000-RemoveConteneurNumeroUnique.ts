import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveConteneurNumeroUnique1708700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique constraint on conteneurs.numero to allow reuse of arrivée container numbers
    const table = await queryRunner.getTable('conteneurs');
    const uniqueIndex = table?.indices.find(
      (idx) => idx.columnNames.includes('numero') && idx.isUnique,
    );
    if (uniqueIndex) {
      await queryRunner.dropIndex('conteneurs', uniqueIndex);
    }
    // Also drop unique constraint if it exists
    const uniqueConstraint = table?.uniques.find((u) =>
      u.columnNames.includes('numero'),
    );
    if (uniqueConstraint) {
      await queryRunner.dropUniqueConstraint('conteneurs', uniqueConstraint);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_conteneurs_numero" ON "conteneurs" ("numero")`,
    );
  }
}
