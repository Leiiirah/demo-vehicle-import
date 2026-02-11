import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { VehicleStatus } from '../../../entities/vehicle.entity';

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

  @IsUUID()
  @IsOptional()
  clientId?: string;

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

  @IsNumber()
  @IsOptional()
  sellingPrice?: number;

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
}
