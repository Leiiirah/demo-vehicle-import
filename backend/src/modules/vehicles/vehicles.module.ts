import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from '../../entities/vehicle.entity';
import { Conteneur } from '../../entities/conteneur.entity';
import { Passeport } from '../../entities/passeport.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Conteneur, Passeport])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
