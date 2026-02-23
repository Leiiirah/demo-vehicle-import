import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddCaisseBalance1707900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'caisse_balance',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'balance', type: 'decimal', precision: 14, scale: 2, default: 0 },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // Insert a single default row
    await queryRunner.query(
      `INSERT INTO caisse_balance (balance) VALUES (0)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('caisse_balance', true);
  }
}
