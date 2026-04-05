import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conteneur, ConteneurStatus } from '../../entities/conteneur.entity';
import { Vehicle, VehicleStatus } from '../../entities/vehicle.entity';
import { CreateConteneurDto } from './dto/create-conteneur.dto';
import { UpdateConteneurDto } from './dto/update-conteneur.dto';

@Injectable()
export class ConteneursService {
  constructor(
    @InjectRepository(Conteneur)
    private conteneurRepository: Repository<Conteneur>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
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
    const conteneur = await this.conteneurRepository.findOne({
      where: { id },
      relations: ['vehicles'],
    });
    if (!conteneur) {
      throw new NotFoundException('Conteneur not found');
    }

    // If status changes to 'arrivee', update all vehicles to 'arrived'
    if (
      updateConteneurDto.status === ConteneurStatus.ARRIVEE &&
      conteneur.status !== ConteneurStatus.ARRIVEE
    ) {
      const vehicleIds = (conteneur.vehicles || [])
        .filter((v) => v.status !== VehicleStatus.SOLD)
        .map((v) => v.id);
      if (vehicleIds.length > 0) {
        await this.vehicleRepository
          .createQueryBuilder()
          .update(Vehicle)
          .set({ status: VehicleStatus.ARRIVED, arrivalDate: () => 'CURRENT_DATE' })
          .whereInIds(vehicleIds)
          .execute();
      }
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
