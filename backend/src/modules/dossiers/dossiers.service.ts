import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dossier } from '../../entities/dossier.entity';
import { CreateDossierDto } from './dto/create-dossier.dto';
import { UpdateDossierDto } from './dto/update-dossier.dto';

@Injectable()
export class DossiersService {
  constructor(
    @InjectRepository(Dossier)
    private dossierRepository: Repository<Dossier>,
  ) {}

  async findAll() {
    return this.dossierRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['supplier', 'conteneurs'],
    });
  }

  async findOne(id: string) {
    const dossier = await this.dossierRepository.findOne({
      where: { id },
      relations: [
        'supplier',
        'conteneurs',
        'conteneurs.vehicles',
        'conteneurs.vehicles.client',
        'payments',
      ],
    });
    if (!dossier) {
      throw new NotFoundException('Dossier not found');
    }
    return dossier;
  }

  async create(createDossierDto: CreateDossierDto) {
    const dossier = this.dossierRepository.create(createDossierDto);
    return this.dossierRepository.save(dossier);
  }

  async update(id: string, updateDossierDto: UpdateDossierDto) {
    const dossier = await this.dossierRepository.findOne({ where: { id } });
    if (!dossier) {
      throw new NotFoundException('Dossier not found');
    }
    Object.assign(dossier, updateDossierDto);
    return this.dossierRepository.save(dossier);
  }

  async remove(id: string) {
    const dossier = await this.dossierRepository.findOne({ where: { id } });
    if (!dossier) {
      throw new NotFoundException('Dossier not found');
    }
    await this.dossierRepository.remove(dossier);
    return { message: 'Dossier deleted successfully' };
  }
}
