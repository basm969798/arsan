import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './infrastructure/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule]
})
export class OrderModule {}