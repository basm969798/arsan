import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Offer } from './offer.entity';
import { OfferState } from './offer.enums';
import { OrderService } from '../order/order.service';
import { SystemEvent } from '../system-events/system-event.entity';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer) private readonly offerRepository: Repository<Offer>,
    @InjectRepository(SystemEvent) private readonly eventRepository: Repository<SystemEvent>,
    private readonly orderService: OrderService,
    private readonly dataSource: DataSource,
  ) {}

  async submitOffer(orderId: string, supplierId: string, companyId: string, actorId: string, price: number): Promise<Offer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const offer = this.offerRepository.create({ orderId, supplierId, companyId, price, status: OfferState.CREATED });
      const savedOffer = await queryRunner.manager.save(offer);
      const event = this.eventRepository.create({
        aggregateId: orderId, aggregateType: 'Order', eventType: 'OFFER_CREATED',
        companyId, actorId, version: 0, payload: { offerId: savedOffer.id, supplierId, price }
      });
      await queryRunner.manager.save(event);
      await this.orderService.createOffer(orderId, companyId, actorId);
      await queryRunner.commitTransaction();
      return savedOffer;
    } catch (err) { await queryRunner.rollbackTransaction(); throw err; } finally { await queryRunner.release(); }
  }

  async acceptOffer(offerId: string, orderId: string, companyId: string, actorId: string): Promise<Offer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const offer = await queryRunner.manager.findOne(Offer, { where: { id: offerId, orderId, companyId } });
      if (!offer) throw new NotFoundException('Offer not found');
      offer.status = OfferState.ACCEPTED;
      await queryRunner.manager.save(offer);
      await queryRunner.manager.update(Offer, { orderId, companyId, status: OfferState.CREATED }, { status: OfferState.REJECTED });
      await this.orderService.acceptOffer(orderId, companyId, actorId, Number(offer.price));
      await queryRunner.commitTransaction();
      return offer;
    } catch (err) { await queryRunner.rollbackTransaction(); throw err; } finally { await queryRunner.release(); }
  }
}
