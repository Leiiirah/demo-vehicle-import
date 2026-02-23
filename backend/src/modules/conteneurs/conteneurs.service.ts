import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conteneur } from '../../entities/conteneur.entity';
import { CreateConteneurDto } from './dto/create-conteneur.dto';
import { UpdateConteneurDto } from './dto/update-conteneur.dto';

@Injectable()
export class ConteneursService {
  constructor(
    @InjectRepository(Conteneur)
    private conteneurRepository: Repository<Conteneur>,
  ) {}

  async findAll() {
    return this.conteneurRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['dossier', 'dossier.supplier', 'vehicles'],
    });
  }

  async findOne(id: string) {
    const conteneur = await this.conteneurRepository.findOne({
      where: { id },
      relations: ['dossier', 'dossier.supplier', 'vehicles', 'vehicles.client', 'vehicles.passeport'],
    });
    if (!conteneur) {
      throw new NotFoundException('Conteneur not found');
    }
    return conteneur;
  }

  async create(createConteneurDto: CreateConteneurDto) {
    const conteneur = this.conteneurRepository.create(createConteneurDto);
    return this.conteneurRepository.save(conteneur);
  }

  async update(id: string, updateConteneurDto: UpdateConteneurDto) {
    const conteneur = await this.conteneurRepository.findOne({ where: { id } });
    if (!conteneur) {
      throw new NotFoundException('Conteneur not found');
    }
    Object.assign(conteneur, updateConteneurDto);
    return this.conteneurRepository.save(conteneur);
  }

  async remove(id: string) {
    const conteneur = await this.conteneurRepository.findOne({ where: { id } });
    if (!conteneur) {
      throw new NotFoundException('Conteneur not found');
    }
    await this.conteneurRepository.remove(conteneur);
    return { message: 'Conteneur deleted successfully' };
  }
}
