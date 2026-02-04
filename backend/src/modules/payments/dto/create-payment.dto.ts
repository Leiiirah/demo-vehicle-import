import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  PaymentCurrency,
  PaymentStatus,
  PaymentType,
} from '../../../entities/payment.entity';

export class CreatePaymentDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(PaymentCurrency)
  @IsOptional()
  currency?: PaymentCurrency;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @IsEnum(PaymentType)
  @IsNotEmpty()
  type: PaymentType;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @IsUUID()
  @IsOptional()
  clientId?: string;
}
