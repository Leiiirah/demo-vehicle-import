import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateVehicleChargeDto } from './create-vehicle-charge.dto';

export class UpdateVehicleChargeDto extends PartialType(
  OmitType(CreateVehicleChargeDto, ['vehicleId'] as const),
) {}
