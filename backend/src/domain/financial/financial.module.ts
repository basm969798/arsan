import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialService } from './financial.service';
import { FinancialEvent } from './financial-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialEvent])],
  providers: [FinancialService],
  exports: [FinancialService],
})
export class FinancialModule {}
