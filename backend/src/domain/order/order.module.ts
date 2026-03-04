import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { PickupService } from './pickup.service';
import { OrderController } from './order.controller';
import { Order } from './order.entity';
import { SystemEvent } from '../system-events/system-event.entity';
import { FinancialModule } from '../financial/financial.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, SystemEvent]),
    FinancialModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, PickupService], // ✅ يجب أن تكون موجودة هنا
  exports: [OrderService, PickupService],   // ✅ وتصديرها لباقي الوحدات
})
export class OrderModule {}
