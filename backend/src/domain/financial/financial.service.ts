import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialEvent, FinancialEventType } from './financial-event.entity';

@Injectable()
export class FinancialService {
  constructor(
    @InjectRepository(FinancialEvent)
    private readonly financialRepo: Repository<FinancialEvent>,
  ) {}

  async registerDebt(referenceId: string, companyId: string, actorId: string, amount: number, idempotencyKey: string): Promise<FinancialEvent> {
    if (amount <= 0) throw new BadRequestException("Amount must be greater than zero");

    const event = this.financialRepo.create({
      companyId,
      referenceId,
      eventType: FinancialEventType.DEBT_REGISTERED,
      amount,
      actorId,
      idempotencyKey
    });

    return this.saveEvent(event);
  }

  async registerPayment(referenceId: string, companyId: string, actorId: string, amount: number, idempotencyKey: string): Promise<FinancialEvent> {
    if (amount <= 0) throw new BadRequestException("Amount must be greater than zero");

    const event = this.financialRepo.create({
      companyId,
      referenceId,
      eventType: FinancialEventType.PAYMENT_REGISTERED,
      amount,
      actorId,
      idempotencyKey
    });

    return this.saveEvent(event);
  }

  // 🔴 الحساب الحتمي (Deterministic Calculation)
  async getOrderBalance(referenceId: string, companyId: string): Promise<number> {
    const result = await this.financialRepo
      .createQueryBuilder('fe')
      .select("SUM(CASE WHEN fe.eventType = :debtType THEN fe.amount ELSE -fe.amount END)", "balance")
      .where("fe.referenceId = :referenceId", { referenceId })
      .andWhere("fe.companyId = :companyId", { companyId })
      .setParameters({ debtType: FinancialEventType.DEBT_REGISTERED })
      .getRawOne();

    return Number(result.balance) || 0;
  }

  private async saveEvent(event: FinancialEvent): Promise<FinancialEvent> {
    try {
      return await this.financialRepo.save(event);
    } catch (error: any) {
      // التعامل مع تكرار Idempotency Key (23505 هو كود الخطأ في Postgres)
      if (error.code === '23505' || error.message.includes('UNIQUE constraint failed')) {
        throw new ConflictException(`Idempotency key ${event.idempotencyKey} already exists. Duplicate operation prevented.`);
      }
      throw error;
    }
  }
}