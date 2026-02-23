import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaisseEntry } from '../../entities/caisse-entry.entity';
import { CaisseBalance } from '../../entities/caisse-balance.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { VehicleCharge } from '../../entities/vehicle-charge.entity';
import { Payment } from '../../entities/payment.entity';
import { CaisseService } from './caisse.service';
import { CaisseBalanceService } from './caisse-balance.service';
import { CaisseController } from './caisse.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CaisseEntry, CaisseBalance, Vehicle, VehicleCharge, Payment])],
  controllers: [CaisseController],
  providers: [CaisseService, CaisseBalanceService],
  exports: [CaisseService, CaisseBalanceService],
})
export class CaisseModule {}
