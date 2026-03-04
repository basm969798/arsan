import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PickupService } from './pickup.service';
import { Order } from './order.entity';
import { OrderState } from './order.enums';
import { SystemEvent } from '../system-events/system-event.entity';
import { ConflictException } from '@nestjs/common';

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn((entity) => Promise.resolve({ ...entity })),
      findOne: jest.fn(),
    },
  }),
};

describe('Pickup Service Invariants', () => {
  let service: PickupService;
  let orderRepo: Repository<Order>;

  const orderId = 'order-1';
  const companyId = 'comp-1';
  const actorId = 'driver-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PickupService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SystemEvent),
          useValue: {
            create: jest.fn((dto) => dto),
          },
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<PickupService>(PickupService);
    orderRepo = module.get<Repository<Order>>(getRepositoryToken(Order));
    jest.clearAllMocks();
  });

  it('should generate QR code ONLY if order is READY', async () => {
    (orderRepo.findOne as jest.Mock).mockResolvedValue({ 
      id: orderId, companyId, status: OrderState.READY 
    });

    const qr = await service.generatePickupCode(orderId, companyId, actorId);
    expect(qr).toBeDefined();
  });

  it('should FAIL to generate QR if order is NOT ready', async () => {
    (orderRepo.findOne as jest.Mock).mockResolvedValue({ 
      id: orderId, companyId, status: OrderState.PREPARING 
    });

    await expect(service.generatePickupCode(orderId, companyId, actorId))
      .rejects.toThrow(ConflictException);
  });

  it('should process pickup atomically and emit event', async () => {
    const queryRunner = mockDataSource.createQueryRunner();
    
    // Mock finding the order
    queryRunner.manager.findOne.mockResolvedValue({
      id: orderId, companyId, status: OrderState.READY, version: 5
    });

    // Create a valid QR payload
    const payload = Buffer.from(JSON.stringify({ orderId, companyId })).toString('base64');

    await service.processPickup(payload, actorId);

    // Verify state update to RECEIVED
    expect(queryRunner.manager.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: OrderState.RECEIVED })
    );

    // Verify Event emission
    expect(queryRunner.manager.save).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'ORDER_RECEIVED', aggregateId: orderId })
    );
  });
});
