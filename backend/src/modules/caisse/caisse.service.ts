import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaisseEntry, CaisseEntryType } from '../../entities/caisse-entry.entity';
import { Vehicle, VehicleStatus } from '../../entities/vehicle.entity';
import { VehicleCharge } from '../../entities/vehicle-charge.entity';
import { CreateCaisseEntryDto } from './dto/create-caisse-entry.dto';
import { UpdateCaisseEntryDto } from './dto/update-caisse-entry.dto';

@Injectable()
export class CaisseService {
  constructor(
    @InjectRepository(CaisseEntry)
    private caisseRepo: Repository<CaisseEntry>,
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(VehicleCharge)
    private vehicleChargeRepo: Repository<VehicleCharge>,
  ) {}

  /**
   * Build a consolidated ledger combining:
   * 1. Manual caisse entries (entree / charge)
   * 2. Vehicle charges (transit, frais divers) → shown as "charge"
   * 3. Sold vehicles → shown as "vente_auto"
   */
  async findAll() {
    // 1. Manual caisse entries
    const manualEntries = await this.caisseRepo.find({
      relations: ['vehicle', 'client'],
      order: { date: 'DESC', createdAt: 'DESC' },
    });

    // 2. Vehicle charges from vehicle_charges table
    const vehicleCharges = await this.vehicleChargeRepo.find({
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
    });

    // 3. Sold vehicles (status = sold AND has a client)
    const soldVehicles = await this.vehicleRepo.find({
      where: { status: VehicleStatus.SOLD },
      relations: ['client', 'supplier', 'conteneur'],
      order: { soldDate: 'DESC' },
    });

    // Transform vehicle charges into ledger entries
    const chargeEntries = vehicleCharges.map((vc) => ({
      id: `vc-${vc.id}`,
      type: 'charge' as const,
      montant: Number(vc.amount),
      date: vc.createdAt,
      description: `${vc.label} — ${vc.vehicle?.brand || ''} ${vc.vehicle?.model || ''} ${vc.vehicle?.year || ''}`.trim(),
      reference: vc.vehicle?.vin || null,
      vehicleId: vc.vehicleId,
      vehicle: vc.vehicle || null,
      client: null,
      clientId: null,
      prixVente: null,
      prixRevient: null,
      benefice: null,
      createdAt: vc.createdAt,
      updatedAt: vc.updatedAt,
      _source: 'vehicle_charge',
    }));

    // Transform sold vehicles into sale entries
    const saleEntries = soldVehicles
      .filter((v) => v.clientId) // must have a client
      .map((v) => {
        const prixVente = Number(v.sellingPrice || 0);
        const prixRevient = Number(v.totalCost || 0);
        const benefice = prixVente - prixRevient;
        return {
          id: `vs-${v.id}`,
          type: 'vente_auto' as const,
          montant: prixVente,
          date: v.soldDate || v.updatedAt,
          description: `Vente ${v.brand} ${v.model} ${v.year}`,
          reference: v.vin,
          vehicleId: v.id,
          vehicle: v,
          client: v.client || null,
          clientId: v.clientId,
          prixVente,
          prixRevient,
          benefice,
          createdAt: v.soldDate || v.updatedAt,
          updatedAt: v.updatedAt,
          _source: 'vehicle_sale',
        };
      });

    // Transform manual entries to add _source marker
    const manual = manualEntries.map((e) => ({
      ...e,
      montant: Number(e.montant),
      prixVente: e.prixVente ? Number(e.prixVente) : null,
      prixRevient: e.prixRevient ? Number(e.prixRevient) : null,
      benefice: e.benefice ? Number(e.benefice) : null,
      _source: 'manual',
    }));

    // Combine and sort by date DESC
    const all = [...manual, ...chargeEntries, ...saleEntries];
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return all;
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
    if (entry.type === CaisseEntryType.VENTE_AUTO) {
      throw new Error('Cannot delete automatic sale entries');
    }
    await this.caisseRepo.delete(id);
  }

  async getSummary() {
    // Get all consolidated entries
    const allEntries = await this.findAll();

    let totalEntrees = 0;
    let totalCharges = 0;
    let totalBenefices = 0;

    for (const entry of allEntries) {
      const montant = Number(entry.montant) || 0;
      if (entry.type === 'entree') {
        totalEntrees += montant;
      } else if (entry.type === 'vente_auto') {
        totalEntrees += montant;
        totalBenefices += Number(entry.benefice) || 0;
      } else if (entry.type === 'charge') {
        totalCharges += montant;
      }
    }

    const soldeActuel = totalEntrees - totalCharges;

    return {
      totalEntrees,
      totalCharges,
      totalBenefices,
      soldeActuel,
    };
  }
}
