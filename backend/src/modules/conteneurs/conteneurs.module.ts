import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConteneursController } from './conteneurs.controller';
import { ConteneursService } from './conteneurs.service';
import { Conteneur } from '../../entities/conteneur.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conteneur])],
  controllers: [ConteneursController],
  providers: [ConteneursService],
  exports: [ConteneursService],
})
export class ConteneursModule {}
