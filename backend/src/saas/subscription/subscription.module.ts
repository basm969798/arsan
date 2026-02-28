import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionEntity } from './infrastructure/db/subscription.entity';
import { PlanEntity } from './infrastructure/db/plan.entity';
import { CreateTrialSubscriptionHandler } from './application/handlers/create-trial-subscription.handler';
import { TypeOrmSubscriptionRepository } from './infrastructure/repositories/typeorm-subscription.repository';

// 🛡️ استيراد الأدوات المخصصة لنظامك (وليس مكتبات خارجية)
import { IEventBus } from '../../common/events/event-bus.interface'; 
import { EventsModule } from '../../common/events/events.module'; // 👈 استدعاء موديول أحداثك الخاص

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionEntity, PlanEntity]),
    // 🛡️ الضوء الأخضر: ربط نظام أحداثك بموديول الاشتراكات
    EventsModule 
  ],
  providers: [
    TypeOrmSubscriptionRepository, 
    {
      provide: 'ISubscriptionRepository',
      useClass: TypeOrmSubscriptionRepository,
    },
    {
      provide: CreateTrialSubscriptionHandler,
      inject: [TypeOrmSubscriptionRepository, 'IEventBus'], 
      useFactory: (repo: TypeOrmSubscriptionRepository, eventBus: IEventBus) => {
        return new CreateTrialSubscriptionHandler(repo, eventBus);
      },
    },
  ],
  exports: [CreateTrialSubscriptionHandler],
})
export class SubscriptionModule {}