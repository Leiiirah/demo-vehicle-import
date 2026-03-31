import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZakatRecord } from '../../entities/zakat-record.entity';
import { CreateZakatRecordDto } from './dto/create-zakat-record.dto';
import { UpdateZakatRecordDto } from './dto/update-zakat-record.dto';

@Injectable()
export class ZakatService {
  constructor(
    @InjectRepository(ZakatRecord)
    private zakatRepository: Repository<ZakatRecord>,
  ) {}

  async findAll(): Promise<ZakatRecord[]> {
    return this.zakatRepository.find({ order: { year: 'DESC' } });
  }

  async findOne(id: string): Promise<ZakatRecord> {
    const record = await this.zakatRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Zakat record not found');
    return record;
  }

  async create(dto: CreateZakatRecordDto): Promise<ZakatRecord> {
    const existing = await this.zakatRepository.findOne({ where: { year: dto.year } });
    if (existing) {
      throw new ConflictException(`Un enregistrement Zakat existe déjà pour l'année ${dto.year}`);
    }
    const record = this.zakatRepository.create(dto);
    return this.zakatRepository.save(record);
  }

  async update(id: string, dto: UpdateZakatRecordDto): Promise<ZakatRecord> {
    const record = await this.findOne(id);
    Object.assign(record, dto);
    return this.zakatRepository.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.zakatRepository.remove(record);
  }
}
