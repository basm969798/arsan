import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialRecord } from './domain/entities/financial-record.entity';
import { FinancialLedger } from './domain/entities/financial-ledger.entity';
import { PartOwnership } from './domain/entities/part-ownership.entity';
import { FinanceService } from './application/services/finance.service';
import { FinanceController } from './api/controllers/finance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialRecord, FinancialLedger, PartOwnership])],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
