import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './offer.entity';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { OrderModule } from '../order/order.module';
import { SystemEvent } from '../system-events/system-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, SystemEvent]), OrderModule],
  providers: [OfferService],
  controllers: [OfferController],
})
export class OfferModule {}
