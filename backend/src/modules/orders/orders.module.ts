import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './domain/entities/order.entity';
import { OrderItem } from './domain/entities/order-item.entity';
import { Offer } from './domain/entities/offer.entity';
import { OrdersController } from './api/controllers/orders.controller';
import { OrdersService } from './application/services/orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Offer])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule {}
