import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('car_models')
export class CarModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
