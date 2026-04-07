import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../../entities/sale.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async findAll() {
    return this.saleRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['client', 'vehicles'],
    });
  }

  async findByClient(clientId: string) {
    return this.saleRepository.find({
      where: { clientId },
      order: { date: 'ASC', createdAt: 'ASC' },
      relations: ['vehicles', 'vehicles.conteneur', 'vehicles.conteneur.dossier'],
    });
  }

  async findOne(id: string) {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['client', 'vehicles', 'vehicles.conteneur', 'vehicles.conteneur.dossier'],
    });
    if (!sale) {
      throw new NotFoundException('Sale not found');
    }
    return sale;
  }

  async create(createSaleDto: CreateSaleDto) {
    const { clientId, vehicles: vehicleItems, date } = createSaleDto;

    // Calculate carried debt from previous sales of same client
    const previousSales = await this.saleRepository.find({
      where: { clientId },
      order: { date: 'ASC', createdAt: 'ASC' },
    });

    let carriedDebt = 0;
    for (const prev of previousSales) {
      const remaining = Number(prev.totalSellingPrice) + Number(prev.carriedDebt) - Number(prev.amountPaid);
      carriedDebt += Math.max(0, remaining);
    }

    // Update vehicles and calculate totals
    let totalSellingPrice = 0;
    let totalCost = 0;

    for (const item of vehicleItems) {
      const vehicle = await this.vehicleRepository.findOne({ where: { id: item.vehicleId } });
      if (!vehicle) {
        throw new NotFoundException(`Vehicle ${item.vehicleId} not found`);
      }

      totalSellingPrice += item.sellingPrice;
      totalCost += Number(vehicle.totalCost) || 0;
    }

    const totalProfit = totalSellingPrice - totalCost;
    const debt = totalSellingPrice + carriedDebt; // total owed = selling price + carried debt

    // Create the sale
    const sale = this.saleRepository.create({
      clientId,
      date: date || new Date().toISOString().split('T')[0],
      totalSellingPrice,
      totalCost,
      totalProfit,
      amountPaid: 0,
      debt,
      carriedDebt,
    });

    const savedSale = await this.saleRepository.save(sale);

    // Update vehicles: assign to client and sale
    for (const item of vehicleItems) {
      await this.vehicleRepository.update(item.vehicleId, {
        clientId,
        saleId: savedSale.id,
        sellingPrice: item.sellingPrice,
        status: 'sold' as any,
        soldDate: date || new Date().toISOString().split('T')[0],
      });
    }

    return this.findOne(savedSale.id);
  }

  async addPayment(saleId: string, amount: number) {
    const sale = await this.saleRepository.findOne({ where: { id: saleId } });
    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    const newAmountPaid = Number(sale.amountPaid) + amount;
    const totalOwed = Number(sale.totalSellingPrice) + Number(sale.carriedDebt);
    
    sale.amountPaid = Math.min(newAmountPaid, totalOwed);
    sale.debt = Math.max(0, totalOwed - sale.amountPaid);

    await this.saleRepository.save(sale);

    // Recalculate carried debt for subsequent sales
    await this.recalculateSubsequentDebts(sale.clientId, sale.date);

    return this.findOne(saleId);
  }

  async remove(id: string) {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['vehicles'],
    });
    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    // Unassign vehicles
    for (const vehicle of sale.vehicles) {
      await this.vehicleRepository.update(vehicle.id, {
        clientId: null as any,
        saleId: null as any,
        sellingPrice: null as any,
        status: 'ordered' as any,
        soldDate: null as any,
      });
    }

    const clientId = sale.clientId;
    const saleDate = sale.date;
    await this.saleRepository.remove(sale);

    // Recalculate carried debts
    await this.recalculateSubsequentDebts(clientId, saleDate);

    return { message: 'Sale deleted successfully' };
  }

  private async recalculateSubsequentDebts(clientId: string, fromDate: Date | string) {
    const sales = await this.saleRepository.find({
      where: { clientId },
      order: { date: 'ASC', createdAt: 'ASC' },
    });

    let accumulatedDebt = 0;
    for (const sale of sales) {
      sale.carriedDebt = accumulatedDebt;
      const totalOwed = Number(sale.totalSellingPrice) + accumulatedDebt;
      sale.debt = Math.max(0, totalOwed - Number(sale.amountPaid));
      await this.saleRepository.save(sale);
      accumulatedDebt = sale.debt;
    }
  }
}
