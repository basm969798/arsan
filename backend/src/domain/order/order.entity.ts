// backend/src/domain/order/order.entity.ts
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  VersionColumn 
} from 'typeorm';
import { OrderState } from './order.enums';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  customerId: string;

  @Column({
    type: 'enum',
    enum: OrderState,
    default: OrderState.DRAFT,
  })
  status: OrderState;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  lockedPrice: number;

  @VersionColumn()
  version: number;

  // ✅ أضفنا هذا ليتوافق مع طلبات الـ API
  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  items: any[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}