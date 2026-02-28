import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionEntity } from '../db/subscription.entity';
import { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';

export class TypeOrmSubscriptionRepository implements ISubscriptionRepository {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly repository: Repository<SubscriptionEntity>,
  ) {}

  async createTrial(companyId: string, planId: string, startDate: Date, endDate: Date): Promise<SubscriptionEntity> {
    const subscription = this.repository.create({
      companyId,
      planId,
      startDate,
      endDate,
      status: 'TRIAL'
    });
    return await this.repository.save(subscription);
  }
}
