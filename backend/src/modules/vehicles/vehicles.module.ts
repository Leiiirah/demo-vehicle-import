import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from '../../entities/vehicle.entity';
import { Conteneur } from '../../entities/conteneur.entity';
import { Passeport } from '../../entities/passeport.entity';
import { VehiclePayment } from '../../entities/vehicle-payment.entity';
import { VehicleCharge } from '../../entities/vehicle-charge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Conteneur, Passeport, VehiclePayment, VehicleCharge])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
