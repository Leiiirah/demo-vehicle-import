import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CarModelsService } from './car-models.service';
import { CreateCarModelDto } from './dto/create-car-model.dto';
import { UpdateCarModelDto } from './dto/update-car-model.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/car-models')
@UseGuards(JwtAuthGuard)
export class CarModelsController {
  constructor(private readonly carModelsService: CarModelsService) {}

  @Get()
  findAll(@Query('brand') brand?: string) {
    if (brand) return this.carModelsService.findByBrand(brand);
    return this.carModelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carModelsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCarModelDto) {
    return this.carModelsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCarModelDto) {
    return this.carModelsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carModelsService.remove(id);
  }
}
