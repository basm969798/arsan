import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../../company/infrastructure/db/company.entity';
import { PlanEntity } from './plan.entity';

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  planId: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'TRIAL', 'PAST_DUE', 'CANCELLED', 'EXPIRED'],
    default: 'TRIAL'
  })
  status: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @ManyToOne(() => PlanEntity)
  @JoinColumn({ name: 'planId' })
  plan: PlanEntity;
}
