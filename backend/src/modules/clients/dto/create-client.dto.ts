import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateClientDto {
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

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsNumber()
  @IsOptional()
  pourcentageBenefice?: number;

  @IsNumber()
  @IsOptional()
  prixVente?: number;

  @IsNumber()
  @IsOptional()
  coutRevient?: number;

  @IsNumber()
  @IsOptional()
  detteBenefice?: number;

  @IsBoolean()
  @IsOptional()
  paye?: boolean;
}
