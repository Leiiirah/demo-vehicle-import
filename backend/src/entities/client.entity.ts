import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { Payment } from './payment.entity';
import { Sale } from './sale.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  telephone: string;

  @Column({ nullable: true })
  adresse: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  company: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pourcentageBenefice: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  prixVente: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  coutRevient: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  detteBenefice: number;

  @Column({ default: false })
  paye: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.client)
  vehicles: Vehicle[];

  @OneToMany(() => Payment, (payment) => payment.client)
  payments: Payment[];

  @OneToMany(() => Sale, (sale) => sale.client)
  sales: Sale[];
}
