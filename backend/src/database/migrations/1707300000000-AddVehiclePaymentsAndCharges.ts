import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddVehiclePaymentsAndCharges1707300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create vehicle_payments table
    await queryRunner.createTable(
      new Table({
        name: 'vehicle_payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'vehicleId',
            type: 'uuid',
          },
          {
            name: 'date',
            type: 'date',
          },
          {
            name: 'amountUSD',
            type: 'decimal',
            precision: 14,
            scale: 2,
          },
          {
            name: 'exchangeRate',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'vehicle_payments',
      new TableForeignKey({
        columnNames: ['vehicleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vehicles',
        onDelete: 'CASCADE',
      }),
    );

    // Create vehicle_charges table
    await queryRunner.createTable(
      new Table({
        name: 'vehicle_charges',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'vehicleId',
            type: 'uuid',
          },
          {
            name: 'label',
            type: 'varchar',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 14,
            scale: 2,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'vehicle_charges',
      new TableForeignKey({
        columnNames: ['vehicleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vehicles',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const vehiclePaymentsTable = await queryRunner.getTable('vehicle_payments');
    if (vehiclePaymentsTable) {
      const foreignKey = vehiclePaymentsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('vehicleId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('vehicle_payments', foreignKey);
      }
      await queryRunner.dropTable('vehicle_payments');
    }

    const vehicleChargesTable = await queryRunner.getTable('vehicle_charges');
    if (vehicleChargesTable) {
      const foreignKey = vehicleChargesTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('vehicleId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('vehicle_charges', foreignKey);
      }
      await queryRunner.dropTable('vehicle_charges');
    }
  }
}
