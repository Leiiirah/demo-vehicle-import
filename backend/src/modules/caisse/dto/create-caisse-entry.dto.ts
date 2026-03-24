import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCaisseEntryDto {
  @IsEnum(['entree', 'charge', 'retrait'])
  @IsNotEmpty()
  type: 'entree' | 'charge' | 'retrait';

  @IsNumber()
  @IsNotEmpty()
  montant: number;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;
}
