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
import { Supplier } from './supplier.entity';
import { Conteneur } from './conteneur.entity';
import { Payment } from './payment.entity';

export enum DossierStatus {
  EN_COURS = 'en_cours',
  TERMINE = 'termine',
  ANNULE = 'annule',
}

@Entity('dossiers')
export class Dossier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column()
  supplierId: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.dossiers)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'date' })
  dateCreation: Date;

  @Column({
    type: 'enum',
    enum: DossierStatus,
    default: DossierStatus.EN_COURS,
  })
  status: DossierStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Conteneur, (conteneur) => conteneur.dossier)
  conteneurs: Conteneur[];

  @OneToMany(() => Payment, (payment) => payment.dossier)
  payments: Payment[];
}
