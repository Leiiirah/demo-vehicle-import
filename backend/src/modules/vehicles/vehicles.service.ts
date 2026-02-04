import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../../entities/vehicle.entity';
import { Conteneur } from '../../entities/conteneur.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Conteneur)
    private conteneurRepository: Repository<Conteneur>,
  ) {}

  async findAll() {
    return this.vehicleRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['supplier', 'conteneur', 'conteneur.dossier', 'client'],
    });
  }

  async findOne(id: string) {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['supplier', 'conteneur', 'conteneur.dossier', 'client'],
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async create(createVehicleDto: CreateVehicleDto) {
    // Calculate transport cost per vehicle
    const conteneur = await this.conteneurRepository.findOne({
      where: { id: createVehicleDto.conteneurId },
      relations: ['vehicles'],
    });

    if (!conteneur) {
      throw new NotFoundException('Conteneur not found');
    }

    const vehicleCount = (conteneur.vehicles?.length || 0) + 1;
    const transportCostPerVehicle = Number(conteneur.coutTransport) / vehicleCount;

    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      transportCost: transportCostPerVehicle,
    });

    const savedVehicle = await this.vehicleRepository.save(vehicle);

    // Recalculate transport cost for all vehicles in this container
    await this.recalculateContainerTransportCosts(createVehicleDto.conteneurId);

    return this.findOne(savedVehicle.id);
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    Object.assign(vehicle, updateVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: string) {
    const vehicle = await this.vehicleRepository.findOne({ 
      where: { id },
      relations: ['conteneur'],
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    
    const conteneurId = vehicle.conteneurId;
    await this.vehicleRepository.remove(vehicle);

    // Recalculate transport cost for remaining vehicles
    await this.recalculateContainerTransportCosts(conteneurId);

    return { message: 'Vehicle deleted successfully' };
  }

  private async recalculateContainerTransportCosts(conteneurId: string) {
    const conteneur = await this.conteneurRepository.findOne({
      where: { id: conteneurId },
      relations: ['vehicles'],
    });

    if (conteneur && conteneur.vehicles.length > 0) {
      const transportCostPerVehicle = Number(conteneur.coutTransport) / conteneur.vehicles.length;

      for (const vehicle of conteneur.vehicles) {
        vehicle.transportCost = transportCostPerVehicle;
        await this.vehicleRepository.save(vehicle);
      }
    }
  }
}
