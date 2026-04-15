import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasseportsController } from './passeports.controller';
import { PasseportsService } from './passeports.service';
import { Passeport } from '../../entities/passeport.entity';
import { Vehicle } from '../../entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Passeport, Vehicle])],
  controllers: [PasseportsController],
  providers: [PasseportsService],
  exports: [PasseportsService],
})
export class PasseportsModule {}
