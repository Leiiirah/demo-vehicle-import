import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Dossier } from '../../entities/dossier.entity';
import { Client } from '../../entities/client.entity';
import { Vehicle } from '../../entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dossier, Client, Vehicle])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
