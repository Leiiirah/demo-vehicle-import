import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('profit-history')
  getProfitHistory() {
    return this.dashboardService.getProfitHistory();
  }

  @Get('vehicles-by-status')
  getVehiclesByStatus() {
    return this.dashboardService.getVehiclesByStatus();
  }

  @Get('top-vehicles')
  getTopVehicles() {
    return this.dashboardService.getTopVehicles();
  }
}
