import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarModel } from '../../entities/car-model.entity';
import { CarModelsService } from './car-models.service';
import { CarModelsController } from './car-models.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CarModel])],
  controllers: [CarModelsController],
  providers: [CarModelsService],
  exports: [CarModelsService],
})
export class CarModelsModule {}
