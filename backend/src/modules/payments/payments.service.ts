import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Dossier, DossierStatus } from '../../entities/dossier.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CaisseService } from '../caisse/caisse.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Dossier)
    private dossierRepository: Repository<Dossier>,
    private caisseService: CaisseService,
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
    // Overpayment is allowed — excess becomes supplier credit

    // Calculate DZD amount to deduct
    const deductAmount = Number(createPaymentDto.amount) * Number(createPaymentDto.exchangeRate || 1);

    // Check caisse balance using dynamic summary (soldeActuel)
    const summary = await this.caisseService.getSummary();
    if (deductAmount > summary.soldeActuel) {
      throw new BadRequestException(
        `Solde caisse insuffisant. Solde actuel: ${summary.soldeActuel.toLocaleString('fr-FR')} DZD, Montant requis: ${deductAmount.toLocaleString('fr-FR')} DZD`,
      );
    }

    const payment = this.paymentRepository.create(createPaymentDto);
    const saved = await this.paymentRepository.save(payment);

    // Auto-update dossier status if fully paid
    if (saved.dossierId) {
      await this.autoUpdateDossierStatus(saved.dossierId);
    }

    return saved;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    Object.assign(payment, updatePaymentDto);
    const saved = await this.paymentRepository.save(payment);

    // Auto-update dossier status after payment edit
    if (saved.dossierId) {
      await this.autoUpdateDossierStatus(saved.dossierId);
    }

    return saved;
  }

  async remove(id: string) {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    const dossierId = payment.dossierId;

    await this.paymentRepository.remove(payment);

    // Auto-update dossier status after payment deletion (may revert to en_cours)
    if (dossierId) {
      await this.autoUpdateDossierStatus(dossierId);
    }

    return { message: 'Payment deleted successfully' };
  }

  async getDossierPaymentStats(dossierId: string) {
    const vehicles = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .innerJoin('vehicle.conteneur', 'conteneur')
      .where('conteneur.dossierId = :dossierId', { dossierId })
      .getMany();

    const totalDue = vehicles.reduce((sum, v) => sum + Number(v.purchasePrice) + Number(v.transportCost || 0), 0);

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

  /**
   * Auto-update dossier status based on payment progress:
   * - progress >= 100 → "solde"
   * - progress < 100 → "en_cours" (only if currently solde, to revert on payment deletion)
   */
  private async autoUpdateDossierStatus(dossierId: string) {
    const stats = await this.getDossierPaymentStats(dossierId);
    const dossier = await this.dossierRepository.findOne({ where: { id: dossierId } });
    if (!dossier) return;

    if (stats.progress >= 100 && dossier.status !== DossierStatus.SOLDE) {
      dossier.status = DossierStatus.SOLDE;
      await this.dossierRepository.save(dossier);
    } else if (stats.progress < 100 && dossier.status === DossierStatus.SOLDE) {
      dossier.status = DossierStatus.EN_COURS;
      await this.dossierRepository.save(dossier);
    }
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
        message: `Le montant total des paiements (${newTotal} USD) dépasse le total dû (${stats.totalDue} USD)`,
      };
    }

    return { valid: true };
  }
}
