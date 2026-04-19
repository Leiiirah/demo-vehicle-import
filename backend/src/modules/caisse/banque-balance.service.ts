import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BanqueBalance } from '../../entities/banque-balance.entity';
import {
  CaisseEntry,
  CaisseEntryType,
  CaissePaymentMethod,
} from '../../entities/caisse-entry.entity';

@Injectable()
export class BanqueBalanceService {
  constructor(
    @InjectRepository(BanqueBalance)
    private balanceRepo: Repository<BanqueBalance>,
    @InjectRepository(CaisseEntry)
    private caisseEntryRepo: Repository<CaisseEntry>,
  ) {}

  async getBalance(): Promise<{ balance: number; updatedAt: Date }> {
    let row = await this.balanceRepo.findOne({ where: {} });
    if (!row) {
      row = this.balanceRepo.create({ balance: 0 });
      row = await this.balanceRepo.save(row);
    }
    return { balance: Number(row.balance), updatedAt: row.updatedAt };
  }

  async setBalance(balance: number): Promise<{ balance: number; updatedAt: Date }> {
    let row = await this.balanceRepo.findOne({ where: {} });
    const oldBalance = row ? Number(row.balance) : 0;

    if (!row) {
      row = this.balanceRepo.create({ balance });
      row = await this.balanceRepo.save(row);
    } else {
      row.balance = balance;
      row = await this.balanceRepo.save(row);
    }

    // Log the adjustment as a virement caisse entry so it shows up in /banque history
    const diff = balance - oldBalance;
    if (diff !== 0) {
      const entry = this.caisseEntryRepo.create({
        type: diff > 0 ? CaisseEntryType.ENTREE : CaisseEntryType.CHARGE,
        montant: Math.abs(diff),
        date: new Date(),
        description:
          diff > 0
            ? `Approvisionnement banque (+${Math.abs(diff).toLocaleString('fr-FR')} DZD)`
            : `Retrait banque (-${Math.abs(diff).toLocaleString('fr-FR')} DZD)`,
        reference: 'SOLDE_BANQUE',
        paymentMethod: CaissePaymentMethod.VIREMENT,
      });
      await this.caisseEntryRepo.save(entry);
    }

    return { balance: Number(row.balance), updatedAt: row.updatedAt };
  }

  async assertSufficient(amount: number): Promise<void> {
    const { balance } = await this.getBalance();
    if (amount > balance) {
      throw new BadRequestException(
        `Solde banque insuffisant. Solde actuel : ${balance.toLocaleString('fr-FR')} DZD, Montant requis : ${amount.toLocaleString('fr-FR')} DZD`,
      );
    }
  }

  async deduct(amount: number): Promise<void> {
    let row = await this.balanceRepo.findOne({ where: {} });
    if (!row) row = this.balanceRepo.create({ balance: 0 });
    row.balance = Number(row.balance) - amount;
    await this.balanceRepo.save(row);
  }

  async add(amount: number): Promise<void> {
    let row = await this.balanceRepo.findOne({ where: {} });
    if (!row) row = this.balanceRepo.create({ balance: 0 });
    row.balance = Number(row.balance) + amount;
    await this.balanceRepo.save(row);
  }
}
