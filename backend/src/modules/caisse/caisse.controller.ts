import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaisseService } from './caisse.service';
import { CreateCaisseEntryDto } from './dto/create-caisse-entry.dto';
import { UpdateCaisseEntryDto } from './dto/update-caisse-entry.dto';

@Controller('caisse')
@UseGuards(JwtAuthGuard)
export class CaisseController {
  constructor(private readonly caisseService: CaisseService) {}

  @Get()
  findAll() {
    return this.caisseService.findAll();
  }

  @Get('summary')
  getSummary() {
    return this.caisseService.getSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.caisseService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCaisseEntryDto) {
    return this.caisseService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCaisseEntryDto) {
    return this.caisseService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.caisseService.remove(id);
  }
}
