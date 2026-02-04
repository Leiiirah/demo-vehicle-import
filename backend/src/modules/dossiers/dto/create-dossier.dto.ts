import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { DossierStatus } from '../../../entities/dossier.entity';

export class CreateDossierDto {
  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsUUID()
  @IsNotEmpty()
  supplierId: string;

  @IsDateString()
  @IsNotEmpty()
  dateCreation: string;

  @IsEnum(DossierStatus)
  @IsOptional()
  status?: DossierStatus;
}
