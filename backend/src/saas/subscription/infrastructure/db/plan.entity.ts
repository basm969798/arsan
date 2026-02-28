import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('plans')
export class PlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // مثال: Basic, Pro, Enterprise

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  billingCycle: 'MONTHLY' | 'YEARLY';

  // حدود الاستخدام (Usage Limits) - البند 7.1
  @Column({ default: 5 })
  maxUsers: number;

  @Column({ default: 100 })
  maxOrdersPerMonth: number;

  @Column({ type: 'jsonb', nullable: true })
  featureFlags: Record<string, boolean>;

  @CreateDateColumn()
  createdAt: Date;
}
