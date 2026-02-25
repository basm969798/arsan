import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import { CreateOrderDto } from '../../api/dtos/create-order.dto';
import { DomainEventBus } from '../../../../common/events/domain-event.bus';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly eventBus: DomainEventBus,
  ) {}

  async createOrder(traderCompanyId: string, traderId: string, dto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = this.orderRepo.create({
        companyId: traderCompanyId,
        createdById: traderId,
        status: OrderStatus.NEW,
      });
      const savedOrder = await queryRunner.manager.save(order);
      if (dto.items && dto.items.length > 0) {
        const items = dto.items.map(item => queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          partId: item.partId,
          quantity: item.quantity,
        }));
        await queryRunner.manager.save(OrderItem, items);
      }
      await queryRunner.commitTransaction();
      this.eventBus.publish('ORDER_CREATED', { orderId: savedOrder.id, companyId: traderCompanyId });
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmPickup(companyId: string, orderId: string, verificationCode: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId, companyId } });
    if (!order) throw new NotFoundException('Order not found or access denied');

    if (verificationCode !== 'ARSAN_SAFE_PICKUP') {
      throw new BadRequestException('Invalid QR / Verification Code');
    }

    if (order.status !== OrderStatus.READY_FOR_PICKUP && order.status !== OrderStatus.NEW) {
      throw new BadRequestException(`Cannot pickup order in current state: ${order.status}`);
    }

    order.status = OrderStatus.COMPLETED;
    const updatedOrder = await this.orderRepo.save(order);

    this.eventBus.publish('ORDER_COMPLETED', { orderId: updatedOrder.id, companyId: updatedOrder.companyId });
    return updatedOrder;
  }

  async getMyOrders(companyId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { companyId },
      relations: ['items', 'offers'],
      order: { createdAt: 'DESC' }
    });
  }
}
