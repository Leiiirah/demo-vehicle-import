import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CaisseService } from './caisse.service';
import { CaisseBalanceService } from './caisse-balance.service';
import { BanqueBalanceService } from './banque-balance.service';
import { CreateCaisseEntryDto } from './dto/create-caisse-entry.dto';
import { UpdateCaisseEntryDto } from './dto/update-caisse-entry.dto';

@Controller('caisse')
@UseGuards(JwtAuthGuard)
export class CaisseController {
  constructor(
    private readonly caisseService: CaisseService,
    private readonly caisseBalanceService: CaisseBalanceService,
    private readonly banqueBalanceService: BanqueBalanceService,
  ) {}

  @Get()
  findAll() {
    return this.caisseService.findAll();
  }

  @Get('summary')
  getSummary() {
    return this.caisseService.getSummary();
  }

  @Get('balance')
  getBalance() {
    return this.caisseBalanceService.getBalance();
  }

  @Put('balance')
  setBalance(@Body('balance') balance: number) {
    return this.caisseBalanceService.setBalance(balance);
  }

  @Get('banque-balance')
  getBanqueBalance() {
    return this.banqueBalanceService.getBalance();
  }

  @Put('banque-balance')
  setBanqueBalance(@Body('balance') balance: number) {
    return this.banqueBalanceService.setBalance(balance);
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

  @Delete('purge/all')
  purgeAll() {
    return this.caisseService.purgeAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.caisseService.remove(id);
  }
}
