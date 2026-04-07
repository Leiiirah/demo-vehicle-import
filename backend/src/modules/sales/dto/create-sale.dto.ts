import { IsString, IsArray, IsNumber, IsOptional, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class VehicleSaleItem {
  @IsString()
  vehicleId: string;

  @IsNumber()
  sellingPrice: number;
}

export class CreateSaleDto {
  @IsString()
  clientId: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleSaleItem)
  vehicles: VehicleSaleItem[];
}
