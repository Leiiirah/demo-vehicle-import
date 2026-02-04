import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  @IsOptional()
  creditBalance?: number;

  @IsNumber()
  @IsOptional()
  totalPaid?: number;

  @IsNumber()
  @IsOptional()
  remainingDebt?: number;

  @IsNumber()
  @IsOptional()
  vehiclesSupplied?: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;
}
