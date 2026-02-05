import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddVehicleCostFields1707200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add theoreticalRate for manual DZD rate input per vehicle
    await queryRunner.addColumn(
      'vehicles',
      new TableColumn({
        name: 'theoreticalRate',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
        default: 134.5,
      }),
    );

    // Add passeportId to link vehicle to a passport
    await queryRunner.addColumn(
      'vehicles',
      new TableColumn({
        name: 'passeportId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add passeportCost for the passport fee
    await queryRunner.addColumn(
      'vehicles',
      new TableColumn({
        name: 'passeportCost',
        type: 'decimal',
        precision: 12,
        scale: 2,
        isNullable: true,
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('vehicles', 'theoreticalRate');
    await queryRunner.dropColumn('vehicles', 'passeportId');
    await queryRunner.dropColumn('vehicles', 'passeportCost');
  }
}
