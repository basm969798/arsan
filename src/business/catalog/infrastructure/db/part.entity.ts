import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/database/base.entity';

@Entity('parts')
export class PartEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  sku: string; // رمز التخزين التعريفي

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 15.00 })
  vatRate: number; // الضريبة الافتراضية

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
