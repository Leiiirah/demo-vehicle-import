import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateZakatRecordDto {
  @IsNumber()
  @Min(2000)
  year: number;

  @IsNumber()
  assetsTotal: number;

  @IsNumber()
  debtsTotal: number;

  @IsNumber()
  zakatBase: number;

  @IsNumber()
  zakatAmount: number;

  @IsNumber()
  @IsOptional()
  amountPaid?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
