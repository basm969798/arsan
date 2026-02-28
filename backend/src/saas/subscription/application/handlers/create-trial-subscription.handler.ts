import { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';
import { IEventBus } from '../../../../common/events/event-bus.interface';

export class CreateTrialSubscriptionHandler {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly eventBus: IEventBus 
  ) {}

  async handle(companyId: string, planId: string) {
    // 🛡️ تطبيق قاعدة 9: ضمان التوقيت العالمي UTC
    const startDate = new Date(); 
    const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    // تنفيذ العملية في المستودع
    const subscription = await this.subscriptionRepo.createTrial(
      companyId,
      planId,
      startDate,
      endDate
    );

    // 🛡️ تطبيق قاعدة 6.2 و 11: إطلاق حدث رسمي موثق لا يمكن تجاهله
    await this.eventBus.publish({
      type: 'TRIAL_SUBSCRIPTION_STARTED',
      companyId,
      payload: { 
        planId, 
        subscriptionId: subscription.id, 
        expiresAt: endDate 
      },
      occurredAt: new Date() // UTC
    });

    return subscription;
  }
}