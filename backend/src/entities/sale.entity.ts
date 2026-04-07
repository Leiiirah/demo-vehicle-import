import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Client } from './client.entity';
import { Vehicle } from './vehicle.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientId: string;

  @ManyToOne(() => Client, (client) => client.sales)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalSellingPrice: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalCost: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalProfit: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  debt: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  carriedDebt: number; // debt carried from previous sales

  @OneToMany(() => Vehicle, (vehicle) => vehicle.sale)
  vehicles: Vehicle[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
