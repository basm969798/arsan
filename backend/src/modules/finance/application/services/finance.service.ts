import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialRecord } from '../../domain/entities/financial-record.entity';
import { CloseOrderDto } from '../../api/dtos/close-order.dto';
import { DomainEventBus } from '../../../../common/events/domain-event.bus';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinancialRecord)
    private readonly recordRepo: Repository<FinancialRecord>,
    private readonly eventBus: DomainEventBus,
  ) {}

  async closeOrder(companyId: string, dto: CloseOrderDto): Promise<FinancialRecord> {
    const record = this.recordRepo.create({
      companyId,
      orderId: dto.orderId,
      type: dto.type,
      amount: dto.amount,
      note: dto.note,
    });

    const savedRecord = await this.recordRepo.save(record);

    this.eventBus.publish('ORDER_FINANCIALLY_CLOSED', {
      orderId: dto.orderId,
      companyId,
      closingType: dto.type
    });

    return savedRecord;
  }
}
