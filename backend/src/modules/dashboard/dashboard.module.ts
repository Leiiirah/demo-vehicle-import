import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Vehicle } from '../../entities/vehicle.entity';
import { Supplier } from '../../entities/supplier.entity';
import { Payment } from '../../entities/payment.entity';
import { Client } from '../../entities/client.entity';
import { CaisseEntry } from '../../entities/caisse-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Supplier, Payment, Client, CaisseEntry])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
