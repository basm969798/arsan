import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OfferService } from './offer.service';
import { Offer } from './offer.entity';
import { OfferState } from './offer.enums';
import { SystemEvent } from '../system-events/system-event.entity';
import { OrderService } from '../order/order.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

// 🛠️ محاكاة خدمات النظام
const mockOrderService = {
  createOffer: jest.fn(),
  acceptOffer: jest.fn(),
};

// 🛠️ محاكاة عمليات قاعدة البيانات (الترانزكشن) بدقة
const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || 'new-uuid' })),
    findOne: jest.fn(),
    update: jest.fn(),
  },
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

describe('Bidding & Offers Ultimate Invariants Test', () => {
  let service: OfferService;

  const companyId = 'comp-1';
  const orderId = 'order-1';
  const supplierId = 'supp-1';
  const actorId = 'user-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferService,
        { provide: getRepositoryToken(Offer), useValue: { create: jest.fn((dto) => dto) } },
        { provide: getRepositoryToken(SystemEvent), useValue: { create: jest.fn((dto) => dto) } },
        { provide: OrderService, useValue: mockOrderService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OfferService>(OfferService);

    // 🧹 تصفير الذاكرة قبل كل اختبار لضمان عدم تداخل النتائج
    jest.clearAllMocks();
  });

  describe('🛡️ 1. Invariant: Offer Submission (تقديم العروض)', () => {
    it('should submit an offer and update order status successfully', async () => {
      await service.submitOffer(orderId, supplierId, companyId, actorId, 150);

      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({ price: 150, status: OfferState.CREATED })
      );
      expect(mockOrderService.createOffer).toHaveBeenCalledWith(orderId, companyId, actorId);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should reject offer submission with price <= 0 (حماية مالية ضد الأسعار الصفرية أو السالبة)', async () => {
      await expect(service.submitOffer(orderId, supplierId, companyId, actorId, 0))
        .rejects.toThrow(ConflictException);

      // التأكد من أن النظام لم يفتح اتصالاً بقاعدة البيانات أصلاً
      expect(mockQueryRunner.startTransaction).not.toHaveBeenCalled();
    });
  });

  describe('🛡️ 2. Invariant: Offer Acceptance & Price Lock (قبول العرض وقفل السعر)', () => {
    it('should accept offer, reject competing offers, and lock order price', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 'offer-1', orderId, companyId, price: 100, status: OfferState.CREATED
      });

      await service.acceptOffer('offer-1', orderId, companyId, actorId);

      // التأكد من قبول العرض المطلوب
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'offer-1', status: OfferState.ACCEPTED })
      );

      // التأكد من رفض باقي العروض التنافسية لنفس الطلب
      expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
        Offer,
        { orderId, companyId, status: OfferState.CREATED },
        { status: OfferState.REJECTED }
      );

      // التأكد من قفل السعر
      expect(mockOrderService.acceptOffer).toHaveBeenCalledWith(orderId, companyId, actorId, 100);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should forbid accepting an offer that is not in CREATED state (حماية آلة الحالة)', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 'offer-1', orderId, companyId, status: OfferState.REJECTED // عرض مرفوض مسبقاً
      });

      await expect(service.acceptOffer('offer-1', orderId, companyId, actorId))
        .rejects.toThrow(ConflictException);

      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    });
  });

  describe('🛡️ 3. Invariant: Atomic Operations & Rollback (الذرية والتراجع عند الفشل)', () => {
    it('should absolutely rollback offer acceptance if OrderService fails (حماية تناسق البيانات)', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 'offer-1', orderId, companyId, price: 100, status: OfferState.CREATED
      });

      // 💣 محاكاة انهيار في خدمة الطلبات أثناء قفل السعر
      mockOrderService.acceptOffer.mockRejectedValueOnce(new Error('Database Connection Lost'));

      await expect(service.acceptOffer('offer-1', orderId, companyId, actorId))
        .rejects.toThrow('Database Connection Lost');

      // 🔥 التأكد القاطع من أن النظام قام بالتراجع ولم يحفظ بيانات مشوهة
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      // التأكد من إغلاق الاتصال بقاعدة البيانات لمنع تسرب الذاكرة (Memory Leak)
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('🛡️ 4. Invariant: Event Integrity & Audit Trail (نزاهة سجل الأحداث)', () => {
    it('should emit exactly structured OFFER_CREATED event for the audit log', async () => {
      await service.submitOffer(orderId, supplierId, companyId, actorId, 150);

      // التدقيق في محتوى الحدث الذي سيُسجل للأبد
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'OFFER_CREATED',
          aggregateType: 'Order',
          aggregateId: orderId,
          companyId: companyId,
          actorId: actorId,
          payload: expect.objectContaining({ price: 150 })
        })
      );
    });
  });

  describe('🛡️ 5. Invariant: Multi-tenancy Isolation (العزل الأمني للشركات)', () => {
    it('should throw NotFound if actor tries to accept an offer belonging to another company (حماية من الاختراق المتقاطع)', async () => {
      // قاعدة البيانات سترد بـ null لأن companyId الممرر لا يطابق العرض
      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      await expect(service.acceptOffer('offer-1', orderId, 'HACKER_COMPANY_ID', actorId))
        .rejects.toThrow(NotFoundException);

      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    });
  });
});