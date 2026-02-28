import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/database/base.entity';
import { Company } from '../../../company/infrastructure/db/company.entity';
import { PlanEntity } from './plan.entity';

@Entity('subscriptions')
export class SubscriptionEntity extends BaseEntity {

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

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => PlanEntity)
  @JoinColumn({ name: 'planId' })
  plan: PlanEntity;
}
