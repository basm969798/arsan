// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 👈 استيراد ConfigService
import { OrderModule } from './domain/order/order.module';
import { FinancialModule } from './domain/financial/financial.module';
import { SystemEventsModule } from './domain/system-events/system-events.module';
import { OfferModule } from './domain/offer/offer.module';

@Module({
  imports: [
    // 1. تحميل الإعدادات أولاً
    ConfigModule.forRoot({ isGlobal: true }), 

    // 2. الربط الديناميكي مع قاعدة البيانات
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // إذا وجد رابطاً كاملاً (مثل ريبلت) يستخدمه، وإلا يستخدم الإعدادات المفصلة
        url: configService.get('DATABASE_URL'), 
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'heliumdb'), // 👈 هنا يطبق اسم القاعدة
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
      }),
    }),
    OrderModule,
    FinancialModule,
    SystemEventsModule,
    OfferModule,
  ],
})
export class AppModule {}