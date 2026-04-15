import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Passeport } from '../../entities/passeport.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { CreatePasseportDto } from './dto/create-passeport.dto';
import { UpdatePasseportDto } from './dto/update-passeport.dto';

@Injectable()
export class PasseportsService {
  constructor(
    @InjectRepository(Passeport)
    private passeportRepository: Repository<Passeport>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async findAll() {
    const passeports = await this.passeportRepository.find({
      order: { createdAt: 'DESC' },
    });
    // Attach vehicle count for each passeport
    const ids = passeports.map((p) => p.id);
    let vehicleCounts: Record<string, number> = {};
    if (ids.length > 0) {
      const counts = await this.vehicleRepository
        .createQueryBuilder('v')
        .select('v.passeportId', 'passeportId')
        .addSelect('COUNT(*)::int', 'count')
        .where('v.passeportId IN (:...ids)', { ids })
        .groupBy('v.passeportId')
        .getRawMany();
      vehicleCounts = Object.fromEntries(counts.map((c) => [c.passeportId, c.count]));
    }
    return passeports.map((p) => ({
      ...p,
      vehicleCount: vehicleCounts[p.id] || 0,
    }));
  }

  async findOne(id: string) {
    const passeport = await this.passeportRepository.findOne({
      where: { id },
    });
    if (!passeport) {
      throw new NotFoundException('Passeport not found');
    }
    // Attach vehicles linked to this passeport
    const vehicles = await this.vehicleRepository.find({
      where: { passeportId: id },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
    return { ...passeport, vehicles };
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
