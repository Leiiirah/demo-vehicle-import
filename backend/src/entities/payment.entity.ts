import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Supplier } from './supplier.entity';
import { Client } from './client.entity';
import { Dossier } from './dossier.entity';

export enum PaymentCurrency {
  USD = 'USD',
  DZD = 'DZD',
}

export enum PaymentType {
  SUPPLIER_PAYMENT = 'supplier_payment',
  CLIENT_PAYMENT = 'client_payment',
  TRANSPORT = 'transport',
  FEES = 'fees',
}

export enum PaymentStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentCurrency,
    default: PaymentCurrency.USD,
  })
  currency: PaymentCurrency;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 134.5 })
  exchangeRate: number;

  @Column({
    type: 'enum',
    enum: PaymentType,
  })
  type: PaymentType;

  @Column()
  reference: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  supplierId: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.payments, { nullable: true })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ nullable: true })
  clientId: string;

  @ManyToOne(() => Client, (client) => client.payments, { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column({ nullable: true })
  dossierId: string;

  @ManyToOne(() => Dossier, (dossier) => dossier.payments, { nullable: true })
  @JoinColumn({ name: 'dossierId' })
  dossier: Dossier;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
