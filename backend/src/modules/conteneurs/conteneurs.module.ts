import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConteneursController } from './conteneurs.controller';
import { ConteneursService } from './conteneurs.service';
import { Conteneur } from '../../entities/conteneur.entity';
import { Vehicle } from '../../entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conteneur, Vehicle])],
  controllers: [ConteneursController],
  providers: [ConteneursService],
  exports: [ConteneursService],
})
export class ConteneursModule {}
