import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddDossierIdToPayment1707100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'dossierId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        columnNames: ['dossierId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'dossiers',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('payments');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('dossierId') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('payments', foreignKey);
    }
    await queryRunner.dropColumn('payments', 'dossierId');
  }
}
