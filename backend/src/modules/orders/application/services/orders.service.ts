import { Injectable, BadRequestException } from '@nestjs/common';
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
        const items = dto.items.map(item => {
          return queryRunner.manager.create(OrderItem, {
            orderId: savedOrder.id,
            partId: item.partId,
            quantity: item.quantity,
          });
        });
        await queryRunner.manager.save(OrderItem, items);
      }

      await queryRunner.commitTransaction();

      this.eventBus.publish('ORDER_CREATED', {
        orderId: savedOrder.id,
        companyId: traderCompanyId
      });

      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyOrders(companyId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { companyId },
      relations: ['items', 'offers'],
      order: { createdAt: 'DESC' }
    });
  }
}
