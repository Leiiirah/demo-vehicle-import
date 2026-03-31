import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateZakatRecordDto {
  @IsNumber()
  @IsOptional()
  amountPaid?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
