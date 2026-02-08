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
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CreateVehiclePaymentDto } from './dto/create-vehicle-payment.dto';
import { UpdateVehiclePaymentDto } from './dto/update-vehicle-payment.dto';
import { CreateVehicleChargeDto } from './dto/create-vehicle-charge.dto';
import { UpdateVehicleChargeDto } from './dto/update-vehicle-charge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }

  // ============ VEHICLE PAYMENTS ============

  @Get(':vehicleId/payments')
  getVehiclePayments(@Param('vehicleId') vehicleId: string) {
    return this.vehiclesService.getVehiclePayments(vehicleId);
  }

  @Post(':vehicleId/payments')
  createVehiclePayment(
    @Param('vehicleId') vehicleId: string,
    @Body() createDto: Omit<CreateVehiclePaymentDto, 'vehicleId'>,
  ) {
    return this.vehiclesService.createVehiclePayment({ ...createDto, vehicleId });
  }

  @Patch('payments/:id')
  updateVehiclePayment(@Param('id') id: string, @Body() updateDto: UpdateVehiclePaymentDto) {
    return this.vehiclesService.updateVehiclePayment(id, updateDto);
  }

  @Delete('payments/:id')
  deleteVehiclePayment(@Param('id') id: string) {
    return this.vehiclesService.deleteVehiclePayment(id);
  }

  // ============ VEHICLE CHARGES ============

  @Get(':vehicleId/charges')
  getVehicleCharges(@Param('vehicleId') vehicleId: string) {
    return this.vehiclesService.getVehicleCharges(vehicleId);
  }

  @Post(':vehicleId/charges')
  createVehicleCharge(
    @Param('vehicleId') vehicleId: string,
    @Body() createDto: Omit<CreateVehicleChargeDto, 'vehicleId'>,
  ) {
    return this.vehiclesService.createVehicleCharge({ ...createDto, vehicleId });
  }

  @Patch('charges/:id')
  updateVehicleCharge(@Param('id') id: string, @Body() updateDto: UpdateVehicleChargeDto) {
    return this.vehiclesService.updateVehicleCharge(id, updateDto);
  }

  @Delete('charges/:id')
  deleteVehicleCharge(@Param('id') id: string) {
    return this.vehiclesService.deleteVehicleCharge(id);
  }
}
