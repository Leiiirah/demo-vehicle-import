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
import { ConteneursService } from './conteneurs.service';
import { CreateConteneurDto } from './dto/create-conteneur.dto';
import { UpdateConteneurDto } from './dto/update-conteneur.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('conteneurs')
@UseGuards(JwtAuthGuard)
export class ConteneursController {
  constructor(private conteneursService: ConteneursService) {}

  @Get()
  findAll() {
    return this.conteneursService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conteneursService.findOne(id);
  }

  @Post()
  create(@Body() createConteneurDto: CreateConteneurDto) {
    return this.conteneursService.create(createConteneurDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConteneurDto: UpdateConteneurDto) {
    return this.conteneursService.update(id, updateConteneurDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conteneursService.remove(id);
  }
}
