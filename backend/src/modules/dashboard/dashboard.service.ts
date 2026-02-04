import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Vehicle, VehicleStatus } from '../../entities/vehicle.entity';
import { Supplier } from '../../entities/supplier.entity';
import { Payment } from '../../entities/payment.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async getStats() {
    const vehicles = await this.vehicleRepository.find();
    const suppliers = await this.supplierRepository.find();

    const totalInvested = vehicles.reduce(
      (sum, v) => sum + Number(v.totalCost || 0),
      0,
    );

    const soldVehicles = vehicles.filter((v) => v.status === VehicleStatus.SOLD);
    const totalProfit = soldVehicles.reduce((sum, v) => {
      const profit = Number(v.sellingPrice || 0) - Number(v.totalCost || 0);
      return sum + profit;
    }, 0);

    const outstandingDebts = suppliers.reduce(
      (sum, s) => sum + Number(s.remainingDebt || 0),
      0,
    );

    const vehiclesInTransit = vehicles.filter(
      (v) => v.status === VehicleStatus.IN_TRANSIT,
    ).length;

    const vehiclesArrived = vehicles.filter(
      (v) => v.status === VehicleStatus.ARRIVED,
    ).length;

    const vehiclesSold = soldVehicles.length;

    const vehiclesOrdered = vehicles.filter(
      (v) => v.status === VehicleStatus.ORDERED,
    ).length;

    return {
      totalInvested,
      totalProfit,
      outstandingDebts,
      vehiclesInTransit,
      vehiclesArrived,
      vehiclesSold,
      vehiclesOrdered,
      totalVehicles: vehicles.length,
    };
  }

  async getProfitHistory() {
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

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

  async getVehiclesByStatus() {
    const vehicles = await this.vehicleRepository.find();

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

  async getTopVehicles() {
    const vehicles = await this.vehicleRepository.find({
      where: { status: VehicleStatus.SOLD },
    });

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
