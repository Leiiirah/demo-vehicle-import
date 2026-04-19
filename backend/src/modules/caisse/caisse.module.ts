import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaisseEntry } from '../../entities/caisse-entry.entity';
import { CaisseBalance } from '../../entities/caisse-balance.entity';
import { BanqueBalance } from '../../entities/banque-balance.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { VehicleCharge } from '../../entities/vehicle-charge.entity';
import { Payment } from '../../entities/payment.entity';
import { CaisseService } from './caisse.service';
import { CaisseBalanceService } from './caisse-balance.service';
import { BanqueBalanceService } from './banque-balance.service';
import { CaisseController } from './caisse.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CaisseEntry, CaisseBalance, BanqueBalance, Vehicle, VehicleCharge, Payment])],
  controllers: [CaisseController],
  providers: [CaisseService, CaisseBalanceService, BanqueBalanceService],
  exports: [CaisseService, CaisseBalanceService, BanqueBalanceService],
})
export class CaisseModule {}
