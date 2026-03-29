import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  getStats(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.dashboardService.getStats(month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
  }

  @Get('profit-history')
  getProfitHistory(
    @Query('year') year?: string,
  ) {
    return this.dashboardService.getProfitHistory(year ? parseInt(year) : undefined);
  }

  @Get('vehicles-by-status')
  getVehiclesByStatus(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.dashboardService.getVehiclesByStatus(month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
  }

  @Get('top-vehicles')
  getTopVehicles(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.dashboardService.getTopVehicles(month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
  }
}
