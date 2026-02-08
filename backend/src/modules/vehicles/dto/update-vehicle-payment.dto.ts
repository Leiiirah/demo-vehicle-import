import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateVehiclePaymentDto } from './create-vehicle-payment.dto';

export class UpdateVehiclePaymentDto extends PartialType(
  OmitType(CreateVehiclePaymentDto, ['vehicleId'] as const),
) {}
