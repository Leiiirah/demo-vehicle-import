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
import { PasseportsService } from './passeports.service';
import { CreatePasseportDto } from './dto/create-passeport.dto';
import { UpdatePasseportDto } from './dto/update-passeport.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('passeports')
@UseGuards(JwtAuthGuard)
export class PasseportsController {
  constructor(private passeportsService: PasseportsService) {}

  @Get()
  findAll() {
    return this.passeportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.passeportsService.findOne(id);
  }

  @Post()
  create(@Body() createPasseportDto: CreatePasseportDto) {
    return this.passeportsService.create(createPasseportDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePasseportDto: UpdatePasseportDto) {
    return this.passeportsService.update(id, updatePasseportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.passeportsService.remove(id);
  }
}
