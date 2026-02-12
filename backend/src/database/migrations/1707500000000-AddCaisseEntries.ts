import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddCaisseEntries1707500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "caisse_entry_type_enum" AS ENUM('entree', 'charge', 'vente_auto')`);

    await queryRunner.createTable(
      new Table({
        name: 'caisse_entries',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'type', type: 'caisse_entry_type_enum' },
          { name: 'montant', type: 'decimal', precision: 14, scale: 2 },
          { name: 'date', type: 'date' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'reference', type: 'varchar', isNullable: true },
          { name: 'vehicleId', type: 'uuid', isNullable: true },
          { name: 'clientId', type: 'uuid', isNullable: true },
          { name: 'prixVente', type: 'decimal', precision: 14, scale: 2, isNullable: true },
          { name: 'prixRevient', type: 'decimal', precision: 14, scale: 2, isNullable: true },
          { name: 'benefice', type: 'decimal', precision: 14, scale: 2, isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'caisse_entries',
      new TableForeignKey({
        columnNames: ['vehicleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vehicles',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'caisse_entries',
      new TableForeignKey({
        columnNames: ['clientId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'clients',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('caisse_entries');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('caisse_entries', fk);
      }
    }
    await queryRunner.dropTable('caisse_entries', true);
    await queryRunner.query(`DROP TYPE IF EXISTS "caisse_entry_type_enum"`);
  }
}
