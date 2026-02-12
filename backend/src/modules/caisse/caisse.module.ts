import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaisseEntry } from '../../entities/caisse-entry.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { VehicleCharge } from '../../entities/vehicle-charge.entity';
import { CaisseService } from './caisse.service';
import { CaisseController } from './caisse.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CaisseEntry, Vehicle, VehicleCharge])],
  controllers: [CaisseController],
  providers: [CaisseService],
  exports: [CaisseService],
})
export class CaisseModule {}
