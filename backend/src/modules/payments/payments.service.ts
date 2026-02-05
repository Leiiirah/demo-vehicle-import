import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async findAll() {
    return this.paymentRepository.find({
      order: { date: 'DESC' },
      relations: ['supplier', 'client', 'dossier'],
    });
  }

  async findByDossier(dossierId: string) {
    return this.paymentRepository.find({
      where: { dossierId },
      order: { date: 'DESC' },
      relations: ['supplier'],
    });
  }

  async findOne(id: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['supplier', 'client', 'dossier'],
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async create(createPaymentDto: CreatePaymentDto) {
    // If this is a supplier payment linked to a dossier, validate total
    if (createPaymentDto.dossierId && createPaymentDto.type === 'supplier_payment') {
      const validation = await this.validateDossierPayment(
        createPaymentDto.dossierId,
        createPaymentDto.amount,
      );
      if (!validation.valid) {
        throw new BadRequestException(validation.message);
      }
    }

    const payment = this.paymentRepository.create(createPaymentDto);
    return this.paymentRepository.save(payment);
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    Object.assign(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async remove(id: string) {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    await this.paymentRepository.remove(payment);
    return { message: 'Payment deleted successfully' };
  }

  async getDossierPaymentStats(dossierId: string) {
    // Get all vehicles in this dossier
    const vehicles = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .innerJoin('vehicle.conteneur', 'conteneur')
      .where('conteneur.dossierId = :dossierId', { dossierId })
      .getMany();

    const totalDue = vehicles.reduce((sum, v) => sum + Number(v.purchasePrice), 0);

    // Get all payments for this dossier
    const payments = await this.paymentRepository.find({
      where: { dossierId, type: 'supplier_payment' as any },
    });

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPaidDZD = payments.reduce(
      (sum, p) => sum + Number(p.amount) * Number(p.exchangeRate),
      0,
    );

    return {
      totalDue,
      totalPaid,
      totalPaidDZD,
      remaining: totalDue - totalPaid,
      progress: totalDue > 0 ? (totalPaid / totalDue) * 100 : 0,
      payments,
    };
  }

  private async validateDossierPayment(
    dossierId: string,
    newAmount: number,
  ): Promise<{ valid: boolean; message?: string }> {
    const stats = await this.getDossierPaymentStats(dossierId);
    const newTotal = stats.totalPaid + newAmount;

    if (newTotal > stats.totalDue) {
      return {
        valid: false,
        message: `Le montant total des paiements (${newTotal} USD) dépasse le prix total des véhicules (${stats.totalDue} USD)`,
      };
    }

    return { valid: true };
  }
}
