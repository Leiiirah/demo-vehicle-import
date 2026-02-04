import { PartialType } from '@nestjs/mapped-types';
import { CreatePasseportDto } from './create-passeport.dto';

export class UpdatePasseportDto extends PartialType(CreatePasseportDto) {}
