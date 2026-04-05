import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { VehicleStatus, VehiclePaymentStatus } from '../../../entities/vehicle.entity';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsString()
  @IsNotEmpty()
  vin: string;

  @ValidateIf((o) => o.clientId !== null)
  @IsUUID()
  @IsOptional()
  clientId?: string | null;

  @IsUUID()
  @IsNotEmpty()
  supplierId: string;

  @IsUUID()
  @IsNotEmpty()
  conteneurId: string;

  @IsUUID()
  @IsOptional()
  passeportId?: string;

  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;

  @IsNumber()
  @IsNotEmpty()
  purchasePrice: number;

  @IsNumber()
  @IsOptional()
  theoreticalRate?: number;

  @IsNumber()
  @IsOptional()
  passeportCost?: number;

  @IsNumber()
  @IsOptional()
  localFees?: number;

  @IsNumber()
  @IsOptional()
  totalCost?: number;

  @ValidateIf((o) => o.sellingPrice !== null)
  @IsNumber()
  @IsOptional()
  sellingPrice?: number | null;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  transmission?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsDateString()
  @IsNotEmpty()
  orderDate: string;

  @IsDateString()
  @IsOptional()
  arrivalDate?: string;

  @IsDateString()
  @IsOptional()
  soldDate?: string;

  @IsEnum(VehiclePaymentStatus)
  @IsOptional()
  paymentStatus?: VehiclePaymentStatus;

  @IsNumber()
  @IsOptional()
  amountPaid?: number;
}
