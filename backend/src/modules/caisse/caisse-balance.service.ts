import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaisseBalance } from '../../entities/caisse-balance.entity';
import { CaisseEntry, CaisseEntryType } from '../../entities/caisse-entry.entity';

@Injectable()
export class CaisseBalanceService {
  constructor(
    @InjectRepository(CaisseBalance)
    private balanceRepo: Repository<CaisseBalance>,
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

    // Create a caisse entry for the difference so it appears in history & Solde Actuel
    const diff = balance - oldBalance;
    if (diff !== 0) {
      const entry = this.caisseEntryRepo.create({
        type: diff > 0 ? CaisseEntryType.ENTREE : CaisseEntryType.CHARGE,
        montant: Math.abs(diff),
        date: new Date(),
        description: diff > 0
          ? `Approvisionnement caisse (+${Math.abs(diff).toLocaleString('fr-FR')} DZD)`
          : `Retrait caisse (-${Math.abs(diff).toLocaleString('fr-FR')} DZD)`,
        reference: 'SOLDE_CAISSE',
      });
      await this.caisseEntryRepo.save(entry);
    }

    return { balance: Number(row.balance), updatedAt: row.updatedAt };
  }

  async deduct(amount: number): Promise<void> {
    let row = await this.balanceRepo.findOne({ where: {} });
    if (!row) {
      row = this.balanceRepo.create({ balance: 0 });
    }
    row.balance = Number(row.balance) - amount;
    await this.balanceRepo.save(row);
  }

  async add(amount: number): Promise<void> {
    let row = await this.balanceRepo.findOne({ where: {} });
    if (!row) {
      row = this.balanceRepo.create({ balance: 0 });
    }
    row.balance = Number(row.balance) + amount;
    await this.balanceRepo.save(row);
  }
}
