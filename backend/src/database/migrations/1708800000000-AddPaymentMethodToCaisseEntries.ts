import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPaymentMethodToCaisseEntries1708800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "caisse_payment_method_enum" AS ENUM('versement', 'virement')`,
    );
    await queryRunner.addColumn(
      'caisse_entries',
      new TableColumn({
        name: 'paymentMethod',
        type: 'caisse_payment_method_enum',
        isNullable: true,
        default: `'versement'`,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('caisse_entries', 'paymentMethod');
    await queryRunner.query(`DROP TYPE IF EXISTS "caisse_payment_method_enum"`);
  }
}
