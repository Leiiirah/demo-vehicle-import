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
import { Conteneur } from './conteneur.entity';
import { Client } from './client.entity';
import { Passeport } from './passeport.entity';

export enum VehicleStatus {
  ORDERED = 'ordered',
  IN_TRANSIT = 'in_transit',
  ARRIVED = 'arrived',
  SOLD = 'sold',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({ unique: true })
  vin: string;

  @Column({ nullable: true })
  clientId: string | null;

  @ManyToOne(() => Client, (client) => client.vehicles, { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  supplierId: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.vehicles)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column()
  conteneurId: string;

  @ManyToOne(() => Conteneur, (conteneur) => conteneur.vehicles)
  @JoinColumn({ name: 'conteneurId' })
  conteneur: Conteneur;

  @Column({ nullable: true })
  passeportId: string;

  @ManyToOne(() => Passeport, { nullable: true })
  @JoinColumn({ name: 'passeportId' })
  passeport: Passeport;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.ORDERED,
  })
  status: VehicleStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  purchasePrice: number; // USD

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  transportCost: number; // USD - calculated from container

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 134.5 })
  theoreticalRate: number; // Manual DZD rate for cost calculation

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  passeportCost: number; // DZD - from linked passport montantDu

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  localFees: number; // DZD - transit fees

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalCost: number; // DZD - calculated prix de revient

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  sellingPrice: number | null; // DZD

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({ type: 'date', nullable: true })
  arrivalDate: Date;

  @Column({ type: 'date', nullable: true })
  soldDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
