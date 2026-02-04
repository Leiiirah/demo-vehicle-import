import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Passeport } from '../../entities/passeport.entity';
import { CreatePasseportDto } from './dto/create-passeport.dto';
import { UpdatePasseportDto } from './dto/update-passeport.dto';

@Injectable()
export class PasseportsService {
  constructor(
    @InjectRepository(Passeport)
    private passeportRepository: Repository<Passeport>,
  ) {}

  async findAll() {
    return this.passeportRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const passeport = await this.passeportRepository.findOne({
      where: { id },
    });
    if (!passeport) {
      throw new NotFoundException('Passeport not found');
    }
    return passeport;
  }

  async create(createPasseportDto: CreatePasseportDto) {
    const passeport = this.passeportRepository.create(createPasseportDto);
    return this.passeportRepository.save(passeport);
  }

  async update(id: string, updatePasseportDto: UpdatePasseportDto) {
    const passeport = await this.passeportRepository.findOne({ where: { id } });
    if (!passeport) {
      throw new NotFoundException('Passeport not found');
    }
    Object.assign(passeport, updatePasseportDto);
    return this.passeportRepository.save(passeport);
  }

  async remove(id: string) {
    const passeport = await this.passeportRepository.findOne({ where: { id } });
    if (!passeport) {
      throw new NotFoundException('Passeport not found');
    }
    await this.passeportRepository.remove(passeport);
    return { message: 'Passeport deleted successfully' };
  }
}
