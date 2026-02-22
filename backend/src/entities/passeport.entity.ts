import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('passeports')
export class Passeport {
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

  @Column({ unique: true })
  numeroPasseport: string;

  @Column({ nullable: true })
  nin: string;

  @Column({ nullable: true })
  pdfPasseport: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montantDu: number;

  @Column({ default: false })
  paye: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
