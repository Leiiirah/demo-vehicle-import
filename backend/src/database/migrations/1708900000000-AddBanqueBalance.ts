import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddBanqueBalance1708900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'banque_balance',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'balance', type: 'decimal', precision: 14, scale: 2, default: 0 },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.query(`INSERT INTO banque_balance (balance) VALUES (0)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('banque_balance', true);
  }
}
