import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePasseportDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @IsString()
  @IsNotEmpty()
  telephone: string;

  @IsString()
  @IsOptional()
  adresse?: string;

  @IsString()
  @IsNotEmpty()
  numeroPasseport: string;

  @IsString()
  @IsOptional()
  nin?: string;

  @IsString()
  @IsOptional()
  pdfPasseport?: string;

  @IsNumber()
  @IsOptional()
  montantDu?: number;

  @IsBoolean()
  @IsOptional()
  paye?: boolean;
}
