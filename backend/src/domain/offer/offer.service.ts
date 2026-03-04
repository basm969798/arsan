import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Offer } from './offer.entity';
import { OfferState } from './offer.enums';
import { Order } from '../order/order.entity';
import { OrderState } from '../order/order.enums'; // تأكد من المسار الصحيح
import { SystemEvent } from '../system-events/system-event.entity';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer) private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(SystemEvent) private readonly eventRepository: Repository<SystemEvent>,
    private readonly dataSource: DataSource,
  ) {}

  async submitOffer(orderId: string, supplierId: string, companyId: string, actorId: string, price: number): Promise<Offer> {
    if (price <= 0) throw new ConflictException('Offer price must be greater than zero.');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. جلب الطلب لمعرفة الـ Version الحالي
      const order = await queryRunner.manager.findOne(Order, { 
        where: { id: orderId, companyId } 
      });
      if (!order) throw new NotFoundException('Order not found');

      // 2. إنشاء العرض
      const offer = this.offerRepository.create({ 
        orderId, 
        supplierId, 
        companyId, 
        price, 
        status: OfferState.CREATED 
      });
      const savedOffer = await queryRunner.manager.save(offer);

      // 3. تحديث حالة الطلب إلى OFFERED باستخدام الـ Enum
      await queryRunner.manager.update(Order, 
        { id: orderId }, 
        { status: OrderState.OFFERED }
      );

      // 4. إصدار حدث إنشاء عرض (استخدام نسخة الطلب + 1)
      const nextVersion = (order.version || 0) + 1;
      const event = this.eventRepository.create({
        aggregateId: orderId, 
        aggregateType: 'Order', 
        eventType: 'OFFER_CREATED',
        companyId, 
        actorId, 
        version: nextVersion, 
        payload: { offerId: savedOffer.id, price }
      });
      await queryRunner.manager.save(event);

      await queryRunner.commitTransaction();
      return savedOffer;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async acceptOffer(offerId: string, orderId: string, companyId: string, actorId: string): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const offer = await queryRunner.manager.findOne(Offer, { where: { id: offerId, companyId, orderId } });
      const order = await queryRunner.manager.findOne(Order, { where: { id: orderId, companyId } });

      if (!offer || !order) throw new NotFoundException('Offer or Order not found');

      // 1. قبول هذا العرض
      offer.status = OfferState.ACCEPTED;
      await queryRunner.manager.save(offer);

      // 2. رفض العروض الأخرى لنفس الطلب (Invariant)
      await queryRunner.manager.update(Offer,
        { orderId, status: OfferState.CREATED },
        { status: OfferState.REJECTED }
      );

      // 3. قفل السعر في الطلب (الهدف الأسمى للنظام)
      const nextOrderVersion = (order.version || 0) + 1;
      await queryRunner.manager.update(Order, 
        { id: orderId }, 
        { 
          status: OrderState.ACCEPTED, 
          lockedPrice: offer.price,
          version: nextOrderVersion 
        }
      );

      // 4. تسجيل حدث القبول
      const event = this.eventRepository.create({
        aggregateId: orderId,
        aggregateType: 'Order',
        eventType: 'OFFER_ACCEPTED',
        companyId,
        actorId,
        version: nextOrderVersion + 1,
        payload: { offerId, price: offer.price }
      });
      await queryRunner.manager.save(event);

      await queryRunner.commitTransaction();
      return { message: 'Offer accepted and price locked', price: offer.price };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}