import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './domain/entities/order.entity';
import { OrderItem } from './domain/entities/order-item.entity';
import { Offer } from './domain/entities/offer.entity';
import { OrderEvent } from './domain/entities/order-event.entity';
import { OrdersController } from './api/controllers/orders.controller';
import { OrdersService } from './application/services/orders.service';
import { OrderSaga } from './application/sagas/order.saga';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Offer, OrderEvent])],
  controllers: [OrdersController],
  providers: [OrdersService, OrderSaga],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule {}
