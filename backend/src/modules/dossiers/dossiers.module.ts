import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DossiersController } from './dossiers.controller';
import { DossiersService } from './dossiers.service';
import { Dossier } from '../../entities/dossier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dossier])],
  controllers: [DossiersController],
  providers: [DossiersService],
  exports: [DossiersService],
})
export class DossiersModule {}
