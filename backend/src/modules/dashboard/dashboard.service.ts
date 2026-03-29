import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Vehicle, VehicleStatus } from '../../entities/vehicle.entity';
import { Supplier } from '../../entities/supplier.entity';
import { Payment } from '../../entities/payment.entity';
import { Client } from '../../entities/client.entity';
import { CaisseEntry, CaisseEntryType } from '../../entities/caisse-entry.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(CaisseEntry)
    private caisseEntryRepository: Repository<CaisseEntry>,
  ) {}

  private getDateRange(month?: number, year?: number): { start: Date; end: Date } | null {
    if (!month && !year) return null;
    const y = year || new Date().getFullYear();
    if (month) {
      const start = new Date(y, month - 1, 1);
      const end = new Date(y, month, 0, 23, 59, 59, 999);
      return { start, end };
    }
    const start = new Date(y, 0, 1);
    const end = new Date(y, 11, 31, 23, 59, 59, 999);
    return { start, end };
  }

  async getStats(month?: number, year?: number) {
    const dateRange = this.getDateRange(month, year);

    let vehicles: Vehicle[];
    if (dateRange) {
      vehicles = await this.vehicleRepository.find({
        where: { createdAt: Between(dateRange.start, dateRange.end) },
      });
    } else {
      vehicles = await this.vehicleRepository.find();
    }

    const suppliers = await this.supplierRepository.find();
    const clients = await this.clientRepository.find();

    // Caisse entries
    let caisseEntries: CaisseEntry[];
    if (dateRange) {
      caisseEntries = await this.caisseEntryRepository.find({
        where: { date: Between(dateRange.start, dateRange.end) },
      });
    } else {
      caisseEntries = await this.caisseEntryRepository.find();
    }

    // Valeur du stock - totalCost of vehicles with status 'ordered' (DZD)
    const stockVehicles = vehicles.filter((v) => v.status === VehicleStatus.ORDERED);
    const valeurStock = stockVehicles.reduce(
      (sum, v) => sum + Number(v.totalCost || 0),
      0,
    );

    // Valeur véhicules chargées - purchasePrice of in_transit vehicles (USD)
    const transitVehicles = vehicles.filter((v) => v.status === VehicleStatus.IN_TRANSIT);
    const valeurChargees = transitVehicles.reduce(
      (sum, v) => sum + Number(v.purchasePrice || 0),
      0,
    );

    // Créance total - sum of detteBenefice from all clients (DZD)
    const creanceTotal = clients.reduce(
      (sum, c) => sum + Number(c.detteBenefice || 0),
      0,
    );

    // Dettes total - sum of remainingDebt from all suppliers (DZD)
    const dettesTotal = suppliers.reduce(
      (sum, s) => sum + Number(s.remainingDebt || 0),
      0,
    );

    // Total caisse - entries minus charges/retraits
    const totalEntrees = caisseEntries
      .filter((e) => e.type === CaisseEntryType.ENTREE || e.type === CaisseEntryType.VENTE_AUTO)
      .reduce((sum, e) => sum + Number(e.montant || 0), 0);
    const totalCharges = caisseEntries
      .filter((e) => e.type === CaisseEntryType.CHARGE || e.type === CaisseEntryType.RETRAIT)
      .reduce((sum, e) => sum + Number(e.montant || 0), 0);
    const totalCaisse = totalEntrees - totalCharges;

    // Total everything - all vehicles totalCost (DZD)
    const totalEverything = vehicles.reduce(
      (sum, v) => sum + Number(v.totalCost || 0),
      0,
    );

    // Keep legacy fields for charts
    const totalInvested = totalEverything;
    const soldVehicles = vehicles.filter((v) => v.status === VehicleStatus.SOLD);
    const totalProfit = soldVehicles.reduce((sum, v) => {
      const profit = Number(v.sellingPrice || 0) - Number(v.totalCost || 0);
      return sum + profit;
    }, 0);

    return {
      valeurStock,
      valeurChargees,
      creanceTotal,
      dettesTotal,
      totalEverything,
      totalCaisse,
      totalInvested,
      totalProfit,
      outstandingDebts: dettesTotal,
      vehiclesInTransit: transitVehicles.length,
      vehiclesArrived: vehicles.filter((v) => v.status === VehicleStatus.ARRIVED).length,
      vehiclesSold: soldVehicles.length,
      vehiclesOrdered: stockVehicles.length,
      totalVehicles: vehicles.length,
    };
  }

  async getProfitHistory(year?: number): Promise<Array<{ month: string; profit: number }>> {
    const now = new Date();
    const months: Array<{ month: string; profit: number }> = [];
    const targetYear = year || now.getFullYear();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(targetYear, now.getMonth() - i, 1);
      const monthEnd = new Date(targetYear, now.getMonth() - i + 1, 0);

      const vehicles = await this.vehicleRepository.find({
        where: {
          status: VehicleStatus.SOLD,
          soldDate: Between(date, monthEnd),
        },
      });

      const profit = vehicles.reduce((sum, v) => {
        return sum + (Number(v.sellingPrice || 0) - Number(v.totalCost || 0));
      }, 0);

      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });

      months.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        profit,
      });
    }

    return months;
  }

  async getVehiclesByStatus(month?: number, year?: number) {
    const dateRange = this.getDateRange(month, year);
    let vehicles: Vehicle[];
    if (dateRange) {
      vehicles = await this.vehicleRepository.find({
        where: { createdAt: Between(dateRange.start, dateRange.end) },
      });
    } else {
      vehicles = await this.vehicleRepository.find();
    }

    return [
      {
        name: 'Commandé',
        value: vehicles.filter((v) => v.status === VehicleStatus.ORDERED).length,
        color: 'hsl(0, 72%, 50%)',
      },
      {
        name: 'En transit',
        value: vehicles.filter((v) => v.status === VehicleStatus.IN_TRANSIT).length,
        color: 'hsl(38, 92%, 50%)',
      },
      {
        name: 'Arrivé',
        value: vehicles.filter((v) => v.status === VehicleStatus.ARRIVED).length,
        color: 'hsl(142, 71%, 45%)',
      },
      {
        name: 'Vendu',
        value: vehicles.filter((v) => v.status === VehicleStatus.SOLD).length,
        color: 'hsl(0, 0%, 45%)',
      },
    ];
  }

  async getTopVehicles(month?: number, year?: number) {
    const dateRange = this.getDateRange(month, year);
    let vehicles: Vehicle[];
    if (dateRange) {
      vehicles = await this.vehicleRepository.find({
        where: { status: VehicleStatus.SOLD, soldDate: Between(dateRange.start, dateRange.end) },
      });
    } else {
      vehicles = await this.vehicleRepository.find({
        where: { status: VehicleStatus.SOLD },
      });
    }

    return vehicles
      .map((v) => ({
        brand: v.brand,
        model: v.model,
        profit: Number(v.sellingPrice || 0) - Number(v.totalCost || 0),
        margin:
          Number(v.totalCost) > 0
            ? ((Number(v.sellingPrice || 0) - Number(v.totalCost)) /
                Number(v.totalCost)) *
              100
            : 0,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }
}
