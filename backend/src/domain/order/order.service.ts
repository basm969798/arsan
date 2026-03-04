import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { OrderState } from './order.enums';
import { FinancialService } from '../financial/financial.service';
import { SystemEvent } from '../system-events/system-event.entity';
import { CreateOrderDto } from './order.dto';
import { OrderStateMachine } from './order-state-machine'; // تأكد من المسار الصحيح

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(SystemEvent) private readonly eventRepository: Repository<SystemEvent>,
    private readonly financialService: FinancialService,
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, companyId: string, actorId: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = this.orderRepository.create({ ...createOrderDto, companyId, status: OrderState.DRAFT, version: 1 });
      const savedOrder = await queryRunner.manager.save(order);
      const event = this.eventRepository.create({
        aggregateId: savedOrder.id, aggregateType: 'Order', eventType: 'ORDER_CREATED',
        companyId, actorId, version: 1, payload: { customerId: createOrderDto.customerId },
      });
      await queryRunner.manager.save(event);
      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) { await queryRunner.rollbackTransaction(); throw err; } finally { await queryRunner.release(); }
  }

  async submitOrder(orderId: string, companyId: string, actorId: string): Promise<Order> {
    return this.updateOrderState(orderId, companyId, actorId, OrderState.SUBMITTED);
  }

  async createOffer(orderId: string, companyId: string, actorId: string): Promise<Order> {
    return this.updateOrderState(orderId, companyId, actorId, OrderState.OFFERED);
  }

  async startPreparing(orderId: string, companyId: string, actorId: string): Promise<Order> {
    return this.updateOrderState(orderId, companyId, actorId, OrderState.PREPARING);
  }

  async acceptOffer(orderId: string, companyId: string, actorId: string, price: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await queryRunner.manager.findOne(Order, { where: { id: orderId, companyId } });
      if (!order) throw new NotFoundException(`Order ${orderId} not found`);

      const validation = OrderStateMachine.validateTransition(order.status, OrderState.ACCEPTED);
      if (!validation.isValid) throw new ConflictException(validation.error);

      order.status = OrderState.ACCEPTED;
      order.lockedPrice = price; 
      order.version += 1;

      const updatedOrder = await queryRunner.manager.save(order);
      const systemEvent = this.eventRepository.create({
        aggregateId: order.id, aggregateType: 'Order', eventType: validation.event || 'OFFER_ACCEPTED',
        companyId, actorId, version: order.version, payload: { lockedPrice: price },
      });
      await queryRunner.manager.save(systemEvent);

      await queryRunner.commitTransaction();
      return updatedOrder;
    } catch (err) { await queryRunner.rollbackTransaction(); throw err; } finally { await queryRunner.release(); }
  }

  async markAsReady(orderId: string, companyId: string, actorId: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await this.executeTransition(queryRunner, orderId, companyId, actorId, OrderState.READY);

      // تسجيل الدين عند الجاهزية
      await this.financialService.registerDebt(
        order.id, 
        companyId, 
        actorId, 
        order.lockedPrice, 
        `debt-${order.id}`
      );

      await queryRunner.commitTransaction();
      return order;
    } catch (err) { await queryRunner.rollbackTransaction(); throw err; } finally { await queryRunner.release(); }
  }

  async payOrder(orderId: string, companyId: string, actorId: string, amount: number): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id: orderId, companyId } });
    if (!order) throw new NotFoundException('Order not found');

    const idempotencyKey = `pay-${orderId}-${Date.now()}`; 
    await this.financialService.registerPayment(
      orderId, 
      companyId, 
      actorId, 
      amount, 
      idempotencyKey
    );
  }

  // ✅ الدالة الجديدة: إلغاء الطلب
  async cancelOrder(orderId: string, companyId: string, actorId: string, reason: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, { where: { id: orderId, companyId } });
      if (!order) throw new NotFoundException('Order not found');

      // 🔴 Invariant: Forbidden States for Cancellation
      const nonCancellableStates = [
        OrderState.PREPARING, 
        OrderState.READY, 
        OrderState.RECEIVED, 
        OrderState.COMPLETED,
        OrderState.CANCELLED
      ];

      if (nonCancellableStates.includes(order.status)) {
        throw new ConflictException(
          `Cancellation Forbidden: Order is in state ${order.status}. Cancellation is only allowed before PREPARING.`
        );
      }

      order.status = OrderState.CANCELLED;
      order.version += 1;
      const savedOrder = await queryRunner.manager.save(order);

      const event = this.eventRepository.create({
        aggregateId: order.id,
        aggregateType: 'Order',
        eventType: 'ORDER_CANCELLED',
        companyId,
        actorId,
        version: order.version,
        payload: { reason }
      });
      await queryRunner.manager.save(event);

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async completeOrder(orderId: string, companyId: string, actorId: string): Promise<Order> {
    const balance = await this.financialService.getOrderBalance(orderId, companyId);
    if (balance > 0) {
      throw new ConflictException(`Cannot complete order. Outstanding balance: ${balance} SAR`);
    }
    return this.updateOrderState(orderId, companyId, actorId, OrderState.COMPLETED);
  }

  private async executeTransition(queryRunner: any, id: string, companyId: string, actorId: string, newState: OrderState): Promise<Order> {
    const order = await queryRunner.manager.findOne(Order, { where: { id, companyId } });
    if (!order) throw new NotFoundException('Order not found');

    const validation = OrderStateMachine.validateTransition(order.status, newState);
    if (!validation.isValid) throw new ConflictException(validation.error);

    order.status = newState;
    order.version += 1;

    const savedOrder = await queryRunner.manager.save(order);
    const event = this.eventRepository.create({
      aggregateId: order.id, aggregateType: 'Order', eventType: validation.event || 'ORDER_UPDATED',
      companyId, actorId, version: order.version, payload: { newState },
    });
    await queryRunner.manager.save(event);
    return savedOrder;
  }

  private async updateOrderState(id: string, companyId: string, actorId: string, newState: OrderState): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await this.executeTransition(queryRunner, id, companyId, actorId, newState);
      await queryRunner.commitTransaction();
      return order;
    } catch (err) { await queryRunner.rollbackTransaction(); throw err; } finally { await queryRunner.release(); }
  }
}