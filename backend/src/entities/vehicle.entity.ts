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
  clientId: string;

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

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  localFees: number; // DZD

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalCost: number; // DZD - calculated

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  sellingPrice: number; // DZD

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
