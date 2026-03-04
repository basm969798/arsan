import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderService } from './order.service';
import { Order } from './order.entity';
import { SystemEvent } from '../system-events/system-event.entity';
import { FinancialService } from '../financial/financial.service';
import { OrderState } from './order.enums';
import { ConflictException } from '@nestjs/common';

// ✅ محاكاة النظام المالي (5 معاملات)
const mockFinancialService = {
  privateBalances: new Map<string, number>(),

  registerDebt: jest.fn(async (orderId: string, companyId: string, actorId: string, amount: number, idempotencyKey: string) => {
    mockFinancialService.privateBalances.set(orderId, amount);
    return Promise.resolve();
  }),

  registerPayment: jest.fn(async (orderId: string, companyId: string, actorId: string, amount: number, idempotencyKey: string) => {
    const current = mockFinancialService.privateBalances.get(orderId) || 0;
    mockFinancialService.privateBalances.set(orderId, current - amount);
    return Promise.resolve();
  }),

  getOrderBalance: jest.fn(async (orderId: string, companyId: string) => {
    return mockFinancialService.privateBalances.get(orderId) || 0;
  }),
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn((entity) => {
        return Promise.resolve({ ...entity, id: entity.id || 'test-order-id' });
      }),
      findOne: jest.fn(), 
    },
  }),
};

describe('System Invariants Compliance Test', () => {
  let service: OrderService;
  let orderRepo: Repository<Order>;
  let eventRepo: Repository<SystemEvent>;

  const companyId = 'company-A';
  const actorId = 'user-1';
  const orderId = 'test-order-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn((dto) => dto),
            save: jest.fn((dto) => Promise.resolve({ ...dto, id: orderId })),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SystemEvent),
          useValue: {
            create: jest.fn((dto) => dto),
            save: jest.fn((dto) => Promise.resolve(dto)),
          },
        },
        { provide: FinancialService, useValue: mockFinancialService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepo = module.get<Repository<Order>>(getRepositoryToken(Order));
    eventRepo = module.get<Repository<SystemEvent>>(getRepositoryToken(SystemEvent));

    mockFinancialService.privateBalances.clear();
    jest.clearAllMocks(); 
  });

  describe('Invariant 1: Lifecycle & Events', () => {
    it('should create order and emit ORDER_CREATED event', async () => {
      const dto = { customerId: 'cust-1', items: [] };

      const queryRunner = mockDataSource.createQueryRunner();
      (queryRunner.manager.save as jest.Mock).mockImplementationOnce(o => Promise.resolve({ ...o, id: orderId }));

      await service.createOrder(dto as any, companyId, actorId);

      expect(queryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderState.DRAFT, companyId })
      );
      expect(queryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'ORDER_CREATED', aggregateId: orderId })
      );
    });
  });

  describe('Invariant 2: State Machine Enforcement', () => {
    it('should forbid illegal transition from DRAFT to COMPLETED directly', async () => {
        const queryRunner = mockDataSource.createQueryRunner();
        queryRunner.manager.findOne.mockResolvedValue({ id: orderId, status: OrderState.DRAFT, companyId, version: 1 });

        await expect(service.completeOrder(orderId, companyId, actorId))
          .rejects
          .toThrow(ConflictException); 
    });
  });

  describe('Invariant 3: Financial Coupling (Critical)', () => {
    it('should register debt when marking as READY and forbid completion if unpaid', async () => {
      const queryRunner = mockDataSource.createQueryRunner();
      const orderState = { 
        id: orderId, 
        status: OrderState.PREPARING, 
        companyId, 
        lockedPrice: 100, 
        version: 2 
      };

      queryRunner.manager.findOne.mockResolvedValue(orderState);

      await service.markAsReady(orderId, companyId, actorId);

      expect(mockFinancialService.registerDebt).toHaveBeenCalledWith(
        orderId,
        companyId,
        actorId,
        100,
        `debt-${orderId}`
      );

      expect(mockFinancialService.privateBalances.get(orderId)).toBe(100);

      await expect(service.completeOrder(orderId, companyId, actorId))
        .rejects
        .toThrow(/Outstanding balance/);
    });

    it('should allow completion ONLY after full payment', async () => {
      mockFinancialService.privateBalances.set(orderId, 100);

      (orderRepo.findOne as jest.Mock).mockResolvedValue({ id: orderId, companyId });

      await service.payOrder(orderId, companyId, actorId, 100);

      expect(mockFinancialService.registerPayment).toHaveBeenCalledWith(
        orderId,
        companyId,
        actorId,
        100,
        expect.any(String) 
      );

      expect(mockFinancialService.privateBalances.get(orderId)).toBe(0);

      const queryRunner = mockDataSource.createQueryRunner();
      queryRunner.manager.findOne.mockResolvedValue({ 
        id: orderId, status: OrderState.READY, companyId, version: 3 
      });

      const result = await service.completeOrder(orderId, companyId, actorId);

      expect(result.status).toBe(OrderState.COMPLETED);
    });
  });

  // ✅ Invariant 4: اختبارات الإلغاء الجديدة
  describe('Invariant 4: Cancellation Safety', () => {
    it('should allow cancellation for SUBMITTED order', async () => {
      const queryRunner = mockDataSource.createQueryRunner();
      // Mock order in SUBMITTED state
      queryRunner.manager.findOne.mockResolvedValue({ 
        id: orderId, status: OrderState.SUBMITTED, companyId, version: 1 
      });

      await service.cancelOrder(orderId, companyId, actorId, 'Customer changed mind');

      // Verify update to CANCELLED
      expect(queryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderState.CANCELLED })
      );
      // Verify Cancellation Event
      expect(queryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'ORDER_CANCELLED', aggregateId: orderId })
      );
    });

    it('should FORBID cancellation if order is PREPARING (Point of No Return)', async () => {
      const queryRunner = mockDataSource.createQueryRunner();
      // Mock order in PREPARING state
      queryRunner.manager.findOne.mockResolvedValue({ 
        id: orderId, status: OrderState.PREPARING, companyId, version: 2 
      });

      // Attempt to cancel -> Should fail
      await expect(service.cancelOrder(orderId, companyId, actorId, 'Too late'))
        .rejects.toThrow(ConflictException);
    });

    it('should FORBID cancellation if order is READY or RECEIVED', async () => {
      const queryRunner = mockDataSource.createQueryRunner();
      queryRunner.manager.findOne.mockResolvedValue({ 
        id: orderId, status: OrderState.RECEIVED, companyId, version: 3 
      });

      await expect(service.cancelOrder(orderId, companyId, actorId, 'Too late'))
        .rejects.toThrow(ConflictException);
    });
  });
});