import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionEntity } from './infrastructure/db/subscription.entity';
import { PlanEntity } from './infrastructure/db/plan.entity';
import { CreateTrialSubscriptionHandler } from './application/handlers/create-trial-subscription.handler';
import { TypeOrmSubscriptionRepository } from './infrastructure/repositories/typeorm-subscription.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionEntity, PlanEntity])],
  providers: [
    {
      provide: 'ISubscriptionRepository',
      useClass: TypeOrmSubscriptionRepository,
    },
    {
      provide: CreateTrialSubscriptionHandler,
      useFactory: (repo: TypeOrmSubscriptionRepository) => new CreateTrialSubscriptionHandler(repo),
      inject: ['ISubscriptionRepository'],
    },
  ],
  exports: [CreateTrialSubscriptionHandler],
})
export class SubscriptionModule {}
