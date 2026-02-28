import { SubscriptionEntity } from '../../infrastructure/db/subscription.entity';

export interface ISubscriptionRepository {
  createTrial(companyId: string, planId: string, startDate: Date, endDate: Date): Promise<SubscriptionEntity>;
}
