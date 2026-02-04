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
import { DossiersService } from './dossiers.service';
import { CreateDossierDto } from './dto/create-dossier.dto';
import { UpdateDossierDto } from './dto/update-dossier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dossiers')
@UseGuards(JwtAuthGuard)
export class DossiersController {
  constructor(private dossiersService: DossiersService) {}

  @Get()
  findAll() {
    return this.dossiersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dossiersService.findOne(id);
  }

  @Post()
  create(@Body() createDossierDto: CreateDossierDto) {
    return this.dossiersService.create(createDossierDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDossierDto: UpdateDossierDto) {
    return this.dossiersService.update(id, updateDossierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dossiersService.remove(id);
  }
}
