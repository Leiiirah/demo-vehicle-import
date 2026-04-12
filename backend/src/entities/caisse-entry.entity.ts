import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { Client } from './client.entity';

export enum CaisseEntryType {
  ENTREE = 'entree',
  CHARGE = 'charge',
  RETRAIT = 'retrait',
  VENTE_AUTO = 'vente_auto',
}

export enum CaissePaymentMethod {
  VERSEMENT = 'versement',
  VIREMENT = 'virement',
}

@Entity('caisse_entries')
export class CaisseEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CaisseEntryType,
  })
  type: CaisseEntryType;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  montant: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  reference: string;

  // For auto entries from vehicle sales
  @Column({ nullable: true })
  vehicleId: string;

  @ManyToOne(() => Vehicle, { nullable: true })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ nullable: true })
  clientId: string;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  // Financial fields for auto entries
  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  prixVente: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  prixRevient: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  benefice: number;

  @Column({
    type: 'enum',
    enum: CaissePaymentMethod,
    nullable: true,
    default: CaissePaymentMethod.VERSEMENT,
  })
  paymentMethod: CaissePaymentMethod;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
