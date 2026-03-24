import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../../entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async findAll() {
    const suppliers = await this.supplierRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['dossiers', 'vehicles', 'payments'],
    });
    return suppliers.map((s) => this.computeStats(s));
  }

  private computeStats(supplier: Supplier) {
    const totalPaid = (supplier.payments || []).reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const vehiclesSupplied = (supplier.vehicles || []).length;
    const creditBalance = Number(supplier.creditBalance) || 0;
    const remainingDebt =
      (supplier.vehicles || []).reduce(
        (sum, v) => sum + Number(v.purchasePrice || 0),
        0,
      ) - totalPaid;

    return {
      ...supplier,
      totalPaid,
      vehiclesSupplied,
      creditBalance,
      remainingDebt: remainingDebt > 0 ? remainingDebt : 0,
    };
  }

  async findOne(id: string) {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ['dossiers', 'vehicles', 'payments'],
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return this.computeStats(supplier);
  }

  async create(createSupplierDto: CreateSupplierDto) {
    const supplier = this.supplierRepository.create(createSupplierDto);
    return this.supplierRepository.save(supplier);
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    Object.assign(supplier, updateSupplierDto);
    return this.supplierRepository.save(supplier);
  }

  async remove(id: string) {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    await this.supplierRepository.remove(supplier);
    return { message: 'Supplier deleted successfully' };
  }
}
