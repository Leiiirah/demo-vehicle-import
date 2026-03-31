import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ZakatService } from './zakat.service';
import { CreateZakatRecordDto } from './dto/create-zakat-record.dto';
import { UpdateZakatRecordDto } from './dto/update-zakat-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('zakat')
@UseGuards(JwtAuthGuard)
export class ZakatController {
  constructor(private readonly zakatService: ZakatService) {}

  @Get()
  findAll() {
    return this.zakatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zakatService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateZakatRecordDto) {
    return this.zakatService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateZakatRecordDto) {
    return this.zakatService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zakatService.remove(id);
  }
}
