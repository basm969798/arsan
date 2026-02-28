import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  order_number: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column('decimal', { precision: 12, scale: 2 })
  locked_price: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 🛡️ هذا هو البند رقم 7 في الدستور - القفل المتفائل
  @VersionColumn()
  version: number;
}
