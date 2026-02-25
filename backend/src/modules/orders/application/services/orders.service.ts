import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../domain/entities/order.entity';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import { CreateOrderDto } from '../../api/dtos/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async createOrder(traderCompanyId: string, traderId: string, dto: CreateOrderDto): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    const order = this.orderRepo.create({
      companyId: traderCompanyId,
      createdById: traderId,
      status: OrderStatus.NEW,
    });

    return this.orderRepo.save(order);
  }

  async getMyOrders(companyId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' }
    });
  }
}
