import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaisseEntry, CaisseEntryType, CaissePaymentMethod } from '../../entities/caisse-entry.entity';
import { Vehicle, VehicleStatus } from '../../entities/vehicle.entity';
import { VehicleCharge } from '../../entities/vehicle-charge.entity';
import { Payment } from '../../entities/payment.entity';
import { CreateCaisseEntryDto } from './dto/create-caisse-entry.dto';
import { UpdateCaisseEntryDto } from './dto/update-caisse-entry.dto';
import { BanqueBalanceService } from './banque-balance.service';

@Injectable()
export class CaisseService {
  constructor(
    @InjectRepository(CaisseEntry)
    private caisseRepo: Repository<CaisseEntry>,
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(VehicleCharge)
    private vehicleChargeRepo: Repository<VehicleCharge>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    private banqueBalanceService: BanqueBalanceService,
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
      _source: 'payment',
    }));

    // Transform sold vehicles into sale entries
    // Only include vehicles that DON'T have payment tracking (paymentStatus)
    // Vehicles with paymentStatus have their payments tracked via caisse entries
    // Additionally, exclude sales with no associated payment (block unpaid sales from caisse)
    const candidateVehicles = soldVehicles.filter((v) => v.clientId && !v.paymentStatus);

    // Check which candidate vehicles have at least one payment in caisse_entries
    const vehicleIdsWithPayments = new Set<string>();
    if (candidateVehicles.length > 0) {
      const vehiclePayments = await this.caisseRepo
        .createQueryBuilder('ce')
        .select('ce.vehicleId')
        .where('ce.vehicleId IN (:...ids)', { ids: candidateVehicles.map((v) => v.id) })
        .andWhere('ce.type = :type', { type: 'entree' })
        .groupBy('ce.vehicleId')
        .getRawMany();
      vehiclePayments.forEach((row) => vehicleIdsWithPayments.add(row.ce_vehicleId));
    }

    const saleEntries = candidateVehicles
      .filter((v) => vehicleIdsWithPayments.has(v.id))
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
      paymentMethod: e.paymentMethod || 'versement',
      _source: 'manual',
    }));

    // 4. Dossier/supplier payments from payments table
    const payments = await this.paymentRepo.find({
      relations: ['supplier', 'client', 'dossier'],
      order: { date: 'DESC' },
    });

    const paymentEntries = payments.map((p) => {
      const amountDZD = Number(p.amount) * Number(p.exchangeRate || 1);
      let description = '';
      if (p.type === 'supplier_payment') {
        description = `Paiement fournisseur${p.supplier ? ' — ' + p.supplier.name : ''}${p.dossier ? ' (Dossier ' + p.dossier.reference + ')' : ''}`;
      } else if (p.type === 'client_payment') {
        description = `Paiement client${p.client ? ' — ' + p.client.nom + ' ' + p.client.prenom : ''}`;
      } else if (p.type === 'transport') {
        description = `Transport${p.dossier ? ' — Dossier ' + p.dossier.reference : ''}`;
      } else if (p.type === 'fees') {
        description = `Frais${p.dossier ? ' — Dossier ' + p.dossier.reference : ''}`;
      } else {
        description = `Paiement — ${p.reference}`;
      }

      // Transport & fees are real caisse charges (like vehicle charges).
      // Supplier payments go to Banque. Client payments are caisse entries.
      const isTransitOrFees = p.type === 'transport' || p.type === 'fees';
      const isClientPayment = p.type === 'client_payment';
      const isSupplierPayment = !isTransitOrFees && !isClientPayment;

      let source: string;
      if (isSupplierPayment) source = 'dossier_payment';
      else if (isTransitOrFees) source = 'payment'; // counted in caisse charges
      else source = 'payment';

      return {
        id: `pay-${p.id}`,
        type: isClientPayment ? ('entree' as const) : ('charge' as const),
        montant: amountDZD,
        date: p.date,
        description,
        reference: p.reference,
        vehicleId: null,
        vehicle: null,
        client: p.client || null,
        clientId: p.clientId || null,
        supplier: p.supplier || null,
        supplierId: p.supplierId || null,
        dossier: p.dossier || null,
        prixVente: null,
        prixRevient: null,
        benefice: null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        _source: source,
        _paymentStatus: p.status,
        _paymentCurrency: p.currency,
        _paymentAmountUSD: Number(p.amount),
        _paymentExchangeRate: Number(p.exchangeRate),
      };
    });

    // Combine and sort by date DESC
    const all = [...manual, ...chargeEntries, ...saleEntries, ...paymentEntries];
    all.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return cb - ca;
    });

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
      paymentMethod: dto.paymentMethod
        ? (dto.paymentMethod as unknown as CaissePaymentMethod)
        : undefined,
    });
    const saved = await this.caisseRepo.save(entry);

    // Sync banque balance for virement entries (these flow through /banque, not cash caisse)
    if (saved.paymentMethod === CaissePaymentMethod.VIREMENT && saved.reference !== 'SOLDE_BANQUE') {
      const amount = Number(saved.montant);
      if (saved.type === CaisseEntryType.ENTREE) {
        await this.banqueBalanceService.add(amount);
      } else if (saved.type === CaisseEntryType.CHARGE || saved.type === CaisseEntryType.RETRAIT) {
        await this.banqueBalanceService.deduct(amount);
      }
    }

    return saved;
  }

  async update(id: string, dto: UpdateCaisseEntryDto): Promise<CaisseEntry> {
    await this.findOne(id);
    await this.caisseRepo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const entry = await this.findOne(id);

    // Refund/reverse banque balance for virement entries
    if (entry.paymentMethod === CaissePaymentMethod.VIREMENT && entry.reference !== 'SOLDE_BANQUE') {
      const amount = Number(entry.montant);
      if (entry.type === CaisseEntryType.ENTREE) {
        await this.banqueBalanceService.deduct(amount);
      } else if (entry.type === CaisseEntryType.CHARGE || entry.type === CaisseEntryType.RETRAIT) {
        await this.banqueBalanceService.add(amount);
      }
    }

    await this.caisseRepo.delete(id);
  }

  async purgeAll(): Promise<{ deleted: number }> {
    const count = await this.caisseRepo.count();
    await this.caisseRepo
      .createQueryBuilder()
      .delete()
      .from('caisse_entries')
      .execute();
    return { deleted: count };
  }

  /**
   * Purge only banque (virement) entries — leaves cash caisse entries intact.
   * Resets the banque balance to 0 since all virement movements are gone.
   */
  async purgeBanque(): Promise<{ deleted: number }> {
    const virementEntries = await this.caisseRepo.find({
      where: { paymentMethod: CaissePaymentMethod.VIREMENT },
    });
    const count = virementEntries.length;
    if (count > 0) {
      await this.caisseRepo
        .createQueryBuilder()
        .delete()
        .from('caisse_entries')
        .where('paymentMethod = :pm', { pm: CaissePaymentMethod.VIREMENT })
        .execute();
    }
    await this.banqueBalanceService.setBalance(0);
    return { deleted: count };
  }

  async getSummary() {
    // Get all consolidated entries
    const allEntries = await this.findAll();

    let totalEntrees = 0;       // Cash entries only (caisse versement) — excludes virements & banque
    let totalCharges = 0;       // All charges paid from caisse: manual charges + vehicle charges
    let totalBenefices = 0;     // Profit on sales (informational only)
    let totalVirements = 0;     // Banque (virement) entries — separate from caisse
    let totalSupplierPayments = 0;

    for (const entry of allEntries) {
      const montant = Number(entry.montant) || 0;
      const isVirement = (entry as any).paymentMethod === 'virement';
      const isDossierPayment = (entry as any)._source === 'dossier_payment';

      if (isDossierPayment) {
        // Supplier payments go to Banque, not Caisse
        totalSupplierPayments += montant;
        continue;
      }

      // Skip virement entries — they belong to Banque, not Caisse
      if (isVirement) {
        if (entry.type === 'entree') totalVirements += montant;
        continue;
      }

      if (entry.type === 'entree') {
        // Manual cash entries only (vente_auto excluded to avoid double-counting
        // since each sale already has its own 'entree' caisse entries)
        totalEntrees += montant;
      } else if (entry.type === 'vente_auto') {
        // Informational only — actual cash already counted via 'entree' entries
        totalBenefices += Number(entry.benefice) || 0;
      } else if (entry.type === 'charge' || entry.type === 'retrait') {
        // Includes manual charges + vehicle_charges (frais véhicule) + retraits
        totalCharges += montant;
      }
    }

    const soldeActuel = totalEntrees - totalCharges;

    return {
      totalEntrees,
      totalCharges,
      totalBenefices,
      soldeActuel,
      totalVirements,
      totalSupplierPayments,
    };
  }
}
