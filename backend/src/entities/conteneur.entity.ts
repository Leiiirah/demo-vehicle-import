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
import { Dossier } from './dossier.entity';
import { Vehicle } from './vehicle.entity';

export enum ConteneurType {
  TWENTY_FT = '20ft',
  FORTY_FT = '40ft',
  FORTY_FT_HC = '40ft_hc',
}

export enum ConteneurStatus {
  CHARGE = 'charge',
  ARRIVEE = 'arrivee',
  DECHARGE = 'decharge',
}

@Entity('conteneurs')
export class Conteneur {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  numero: string;

  @Column()
  dossierId: string;

  @ManyToOne(() => Dossier, (dossier) => dossier.conteneurs)
  @JoinColumn({ name: 'dossierId' })
  dossier: Dossier;

  @Column({
    type: 'enum',
    enum: ConteneurType,
    default: ConteneurType.FORTY_FT,
  })
  type: ConteneurType;

  @Column({
    type: 'enum',
    enum: ConteneurStatus,
    default: ConteneurStatus.CHARGE,
  })
  status: ConteneurStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  coutTransport: number;

  @Column({ type: 'date', nullable: true })
  dateDepart: Date;

  @Column({ type: 'date', nullable: true })
  dateArrivee: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.conteneur)
  vehicles: Vehicle[];
}
