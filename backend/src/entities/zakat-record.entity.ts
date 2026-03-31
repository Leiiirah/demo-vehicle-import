import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('zakat_records')
export class ZakatRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  assetsTotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  debtsTotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  zakatBase: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  zakatAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
