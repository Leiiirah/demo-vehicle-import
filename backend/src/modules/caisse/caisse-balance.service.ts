import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaisseBalance } from '../../entities/caisse-balance.entity';

@Injectable()
export class CaisseBalanceService {
  constructor(
    @InjectRepository(CaisseBalance)
    private balanceRepo: Repository<CaisseBalance>,
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
    if (!row) {
      row = this.balanceRepo.create({ balance });
      row = await this.balanceRepo.save(row);
    } else {
      row.balance = balance;
      row = await this.balanceRepo.save(row);
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
