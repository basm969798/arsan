import { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';

export class CreateTrialSubscriptionHandler {
  constructor(private readonly subscriptionRepo: ISubscriptionRepository) {}

  async handle(companyId: string, planId: string) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 14); // البند 5.3: 14 يوم مجاني تلقائياً

    return await this.subscriptionRepo.createTrial(
      companyId,
      planId,
      startDate,
      endDate
    );
  }
}
