import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateVehicleChargeDto {
  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
