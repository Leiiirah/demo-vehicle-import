import { PartialType } from '@nestjs/mapped-types';
import { CreateCaisseEntryDto } from './create-caisse-entry.dto';

export class UpdateCaisseEntryDto extends PartialType(CreateCaisseEntryDto) {}
