import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { Offer } from './offer.entity';
import { Order } from '../order/order.entity'; // 👈 استيراد كيان الطلب
import { SystemEvent } from '../system-events/system-event.entity'; // 👈 استيراد كيان الأحداث

@Module({
  imports: [
    // هنا نخبر NestJS أن هذه الوحدة يحق لها التعامل مع هذه الجداول الثلاثة
    TypeOrmModule.forFeature([Offer, Order, SystemEvent]), 
  ],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}