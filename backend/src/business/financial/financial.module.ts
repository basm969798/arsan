import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialEvent } from './infrastructure/financial-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialEvent])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule]
})
export class FinancialModule {}