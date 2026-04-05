import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DossiersController } from './dossiers.controller';
import { DossiersService } from './dossiers.service';
import { Dossier } from '../../entities/dossier.entity';
import { Payment } from '../../entities/payment.entity';
import { Vehicle } from '../../entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dossier, Payment, Vehicle])],
  controllers: [DossiersController],
  providers: [DossiersService],
  exports: [DossiersService],
})
export class DossiersModule {}
