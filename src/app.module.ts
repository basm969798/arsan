import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { IdentityModule } from './saas/identity/identity.module';
import { CompanyModule } from './saas/company/company.module';
import { SubscriptionModule } from './saas/subscription/subscription.module';
import { CatalogModule } from './business/catalog/catalog.module';
import { TenantInterceptor } from './shared/interceptors/tenant.interceptor';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'arsan_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    IdentityModule,
    CompanyModule,
    SubscriptionModule,
    CatalogModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
  ],
})
export class AppModule {}
