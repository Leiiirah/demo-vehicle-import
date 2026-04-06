import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from '../../entities/payment.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { VehicleCharge } from '../../entities/vehicle-charge.entity';
import { Dossier } from '../../entities/dossier.entity';
import { CaisseModule } from '../caisse/caisse.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Vehicle, VehicleCharge, Dossier]), CaisseModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
