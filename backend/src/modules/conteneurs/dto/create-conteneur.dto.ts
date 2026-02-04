import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ConteneurStatus, ConteneurType } from '../../../entities/conteneur.entity';

export class CreateConteneurDto {
  @IsString()
  @IsNotEmpty()
  numero: string;

  @IsUUID()
  @IsNotEmpty()
  dossierId: string;

  @IsEnum(ConteneurType)
  @IsOptional()
  type?: ConteneurType;

  @IsEnum(ConteneurStatus)
  @IsOptional()
  status?: ConteneurStatus;

  @IsNumber()
  @IsOptional()
  coutTransport?: number;

  @IsDateString()
  @IsOptional()
  dateDepart?: string;

  @IsDateString()
  @IsOptional()
  dateArrivee?: string;
}
