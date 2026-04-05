import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dossier, DossierStatus } from '../../entities/dossier.entity';
import { Payment } from '../../entities/payment.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { CreateDossierDto } from './dto/create-dossier.dto';
import { UpdateDossierDto } from './dto/update-dossier.dto';

@Injectable()
export class DossiersService {
  constructor(
    @InjectRepository(Dossier)
    private dossierRepository: Repository<Dossier>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
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

    // Auto-recalculate dossier status based on payment progress
    await this.recalculateStatus(dossier);

    return dossier;
  }

  async findAll() {
    const dossiers = await this.dossierRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['supplier', 'conteneurs', 'conteneurs.vehicles', 'payments'],
    });

    // Recalculate status for all dossiers
    for (const dossier of dossiers) {
      await this.recalculateStatus(dossier);
    }

    return dossiers;
  }

  private async recalculateStatus(dossier: Dossier) {
    if (dossier.status === DossierStatus.ANNULE) return;

    const vehicles = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .innerJoin('vehicle.conteneur', 'conteneur')
      .where('conteneur.dossierId = :dossierId', { dossierId: dossier.id })
      .getMany();

    const totalDue = vehicles.reduce(
      (sum, v) => sum + Number(v.purchasePrice) + Number(v.transportCost || 0), 0
    );

    const payments = await this.paymentRepository.find({
      where: { dossierId: dossier.id, type: 'supplier_payment' as any },
    });
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const progress = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

    if (progress >= 100 && dossier.status !== DossierStatus.TERMINE) {
      dossier.status = DossierStatus.TERMINE;
      await this.dossierRepository.save(dossier);
    } else if (progress < 100 && dossier.status === DossierStatus.TERMINE) {
      dossier.status = DossierStatus.EN_COURS;
      await this.dossierRepository.save(dossier);
    }
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
