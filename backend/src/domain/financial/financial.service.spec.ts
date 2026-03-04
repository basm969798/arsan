import { Test, TestingModule } from '@nestjs/testing';
import { FinancialService } from './financial.service';
import { FinancialEvent, FinancialEventType } from './financial-event.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';

describe('Financial Ledger Invariants Test', () => {
  let service: FinancialService;

  // محاكاة قاعدة البيانات (In-Memory Array)
  let mockDb: FinancialEvent[] = [];

  const mockRepo = {
    create: jest.fn((dto) => {
      const entity = new FinancialEvent();
      Object.assign(entity, dto);
      return entity;
    }),
    save: jest.fn((entity: FinancialEvent) => {
      // محاكاة قيد منع التكرار (Idempotency)
      if (mockDb.find(e => e.idempotencyKey === entity.idempotencyKey)) {
        const error = new Error('UNIQUE constraint failed');
        (error as any).code = '23505';
        throw error;
      }
      mockDb.push(entity);
      return Promise.resolve(entity);
    }),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(() => {
        // محاكاة حساب الرصيد SQL SUM(CASE...)
        const balance = mockDb.reduce((sum, fe) => {
          return fe.eventType === FinancialEventType.DEBT_REGISTERED 
            ? sum + Number(fe.amount) 
            : sum - Number(fe.amount);
        }, 0);
        return Promise.resolve({ balance });
      }),
    })),
  };

  beforeEach(async () => {
    mockDb = []; // تصفير الـ DB قبل كل اختبار
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialService,
        { provide: getRepositoryToken(FinancialEvent), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<FinancialService>(FinancialService);
  });

  it('Invariant 5.3: Should calculate balance deterministically from events', async () => {
    // 1. تسجيل دين بـ 100
    await service.registerDebt('order-1', 'comp-1', 'user-1', 100, 'idemp-1');
    // 2. تسجيل دفعة بـ 40
    await service.registerPayment('order-1', 'comp-1', 'user-1', 40, 'idemp-2');

    // الرصيد يجب أن يكون 60 (100 - 40)
    const balance = await service.getOrderBalance('order-1', 'comp-1');
    expect(balance).toBe(60);
  });

  it('Invariant 5.1 & 9: Should enforce Idempotency (prevent duplicate charges)', async () => {
    // تسجيل دين بـ 50
    await service.registerDebt('order-2', 'comp-1', 'user-1', 50, 'charge-key');

    // محاولة تسجيل نفس الدين بنفس الـ Idempotency Key
    await expect(
      service.registerDebt('order-2', 'comp-1', 'user-1', 50, 'charge-key')
    ).rejects.toThrow(ConflictException);
  });

  it('Invariant 5.1: Entity should strictly forbid UPDATE (Immutability)', () => {
    const entity = new FinancialEvent();
    expect(() => entity.preventUpdate()).toThrow(/UPDATE is strictly forbidden/);
  });
});