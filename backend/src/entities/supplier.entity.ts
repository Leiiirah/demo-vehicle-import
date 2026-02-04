import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Dossier } from './dossier.entity';
import { Vehicle } from './vehicle.entity';
import { Payment } from './payment.entity';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  creditBalance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPaid: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  remainingDebt: number;

  @Column({ default: 0 })
  vehiclesSupplied: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Dossier, (dossier) => dossier.supplier)
  dossiers: Dossier[];

  @OneToMany(() => Vehicle, (vehicle) => vehicle.supplier)
  vehicles: Vehicle[];

  @OneToMany(() => Payment, (payment) => payment.supplier)
  payments: Payment[];
}
