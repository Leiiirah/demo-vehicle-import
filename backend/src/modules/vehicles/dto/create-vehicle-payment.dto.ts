import { IsDateString, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateVehiclePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  amountUSD: number;

  @IsNumber()
  @IsNotEmpty()
  exchangeRate: number;
}
