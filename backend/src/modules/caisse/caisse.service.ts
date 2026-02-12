import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaisseEntry, CaisseEntryType } from '../../entities/caisse-entry.entity';
import { CreateCaisseEntryDto } from './dto/create-caisse-entry.dto';
import { UpdateCaisseEntryDto } from './dto/update-caisse-entry.dto';

@Injectable()
export class CaisseService {
  constructor(
    @InjectRepository(CaisseEntry)
    private caisseRepo: Repository<CaisseEntry>,
  ) {}

  async findAll(): Promise<CaisseEntry[]> {
    return this.caisseRepo.find({
      relations: ['vehicle', 'client'],
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<CaisseEntry> {
    const entry = await this.caisseRepo.findOne({
      where: { id },
      relations: ['vehicle', 'client'],
    });
    if (!entry) throw new NotFoundException(`Caisse entry ${id} not found`);
    return entry;
  }

  async create(dto: CreateCaisseEntryDto): Promise<CaisseEntry> {
    const entry = this.caisseRepo.create({
      ...dto,
      type: dto.type as CaisseEntryType,
    });
    return this.caisseRepo.save(entry);
  }

  async update(id: string, dto: UpdateCaisseEntryDto): Promise<CaisseEntry> {
    await this.findOne(id);
    await this.caisseRepo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const entry = await this.findOne(id);
    // Prevent deletion of auto entries
    if (entry.type === CaisseEntryType.VENTE_AUTO) {
      throw new Error('Cannot delete automatic sale entries');
    }
    await this.caisseRepo.delete(id);
  }

  async getSummary() {
    const result = await this.caisseRepo
      .createQueryBuilder('c')
      .select([
        `COALESCE(SUM(CASE WHEN c.type IN ('entree', 'vente_auto') THEN c.montant ELSE 0 END), 0)`,
        `COALESCE(SUM(CASE WHEN c.type = 'charge' THEN c.montant ELSE 0 END), 0)`,
        `COALESCE(SUM(CASE WHEN c.type = 'vente_auto' THEN COALESCE(c.benefice, 0) ELSE 0 END), 0)`,
      ])
      .addSelect(
        `COALESCE(SUM(CASE WHEN c.type IN ('entree', 'vente_auto') THEN c.montant ELSE 0 END), 0)`,
        'totalEntrees',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN c.type = 'charge' THEN c.montant ELSE 0 END), 0)`,
        'totalCharges',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN c.type = 'vente_auto' THEN COALESCE(c.benefice, 0) ELSE 0 END), 0)`,
        'totalBenefices',
      )
      .getRawOne();

    const totalEntrees = Number(result.totalEntrees);
    const totalCharges = Number(result.totalCharges);
    const totalBenefices = Number(result.totalBenefices);
    const soldeActuel = totalEntrees - totalCharges;

    return {
      totalEntrees,
      totalCharges,
      totalBenefices,
      soldeActuel,
    };
  }

  // Called when a vehicle is marked as sold
  async createAutoSaleEntry(vehicle: any, client: any): Promise<CaisseEntry> {
    const prixVente = Number(vehicle.sellingPrice || 0);
    const prixRevient = Number(vehicle.totalCost || 0);
    const benefice = prixVente - prixRevient;

    const entry = this.caisseRepo.create({
      type: CaisseEntryType.VENTE_AUTO,
      montant: prixVente,
      date: vehicle.soldDate || new Date(),
      description: `Vente ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      reference: vehicle.vin,
      vehicleId: vehicle.id,
      clientId: client?.id || vehicle.clientId,
      prixVente,
      prixRevient,
      benefice,
    });

    return this.caisseRepo.save(entry);
  }
}
