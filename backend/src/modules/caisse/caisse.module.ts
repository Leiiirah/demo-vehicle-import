import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaisseEntry } from '../../entities/caisse-entry.entity';
import { CaisseService } from './caisse.service';
import { CaisseController } from './caisse.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CaisseEntry])],
  controllers: [CaisseController],
  providers: [CaisseService],
  exports: [CaisseService],
})
export class CaisseModule {}
