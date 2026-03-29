import { IsString, IsOptional } from 'class-validator';

export class CreateCarModelDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
