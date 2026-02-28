import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './common/events/events.module';
import { IdentityModule } from './saas/identity/identity.module';
import { CompanyModule } from './saas/company/company.module';
import { SubscriptionModule } from './saas/subscription/subscription.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
    }),
    EventsModule,
    IdentityModule,
    CompanyModule,
    SubscriptionModule,
  ],
})
export class AppModule {}
