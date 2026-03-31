import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddZakatRecords1708100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'zakat_records',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          { name: 'year', type: 'int' },
          { name: 'assetsTotal', type: 'decimal', precision: 14, scale: 2 },
          { name: 'debtsTotal', type: 'decimal', precision: 14, scale: 2 },
          { name: 'zakatBase', type: 'decimal', precision: 14, scale: 2 },
          { name: 'zakatAmount', type: 'decimal', precision: 14, scale: 2 },
          { name: 'amountPaid', type: 'decimal', precision: 14, scale: 2, default: '0' },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('zakat_records');
  }
}
