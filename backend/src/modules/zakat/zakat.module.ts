import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZakatRecord } from '../../entities/zakat-record.entity';
import { ZakatService } from './zakat.service';
import { ZakatController } from './zakat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ZakatRecord])],
  controllers: [ZakatController],
  providers: [ZakatService],
})
export class ZakatModule {}
