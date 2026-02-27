import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicBid } from './domain/entities/public-bid.entity';
import { BidOffer } from './domain/entities/bid-offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PublicBid, BidOffer])],
  exports: [TypeOrmModule],
})
export class MarketplaceModule {}
