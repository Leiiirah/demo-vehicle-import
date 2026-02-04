import { PartialType } from '@nestjs/mapped-types';
import { CreateConteneurDto } from './create-conteneur.dto';

export class UpdateConteneurDto extends PartialType(CreateConteneurDto) {}
