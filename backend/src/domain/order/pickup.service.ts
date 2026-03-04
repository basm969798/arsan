import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { OrderState } from './order.enums';
import { SystemEvent } from '../system-events/system-event.entity';

@Injectable()
export class PickupService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(SystemEvent) private readonly eventRepository: Repository<SystemEvent>,
    private readonly dataSource: DataSource,
  ) {}

  // 1. توليد رمز الاستلام (QR Data)
  async generatePickupCode(orderId: string, companyId: string, actorId: string): Promise<string> {
    const order = await this.orderRepository.findOne({ where: { id: orderId, companyId } });
    if (!order) throw new NotFoundException('Order not found');
    
    // Invariant: QR Code generated ONLY when order is READY
    if (order.status !== OrderState.READY) {
      throw new ConflictException(`Cannot generate pickup code. Order is in state ${order.status}, expected READY`);
    }

    // Generate a secure payload (in real app, this should be signed/encrypted)
    const payload = JSON.stringify({
      orderId: order.id,
      companyId: order.companyId,
      timestamp: new Date().toISOString(), // Stored as UTC
      type: 'PICKUP_VERIFICATION'
    });

    return Buffer.from(payload).toString('base64'); // Simple encoding for now
  }

  // 2. تنفيذ عملية الاستلام (Atomic Transition)
  async processPickup(qrPayload: string, actorId: string): Promise<Order> {
    // Decode payload
    let data;
    try {
      data = JSON.parse(Buffer.from(qrPayload, 'base64').toString());
    } catch (e) {
      throw new ConflictException('Invalid QR Code format');
    }

    const { orderId, companyId } = data;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock row for update
      const order = await queryRunner.manager.findOne(Order, { 
        where: { id: orderId, companyId },
        lock: { mode: 'pessimistic_write' } // Prevent race conditions
      });

      if (!order) throw new NotFoundException('Order not found');

      // Invariant: Strict state check
      if (order.status !== OrderState.READY) {
        throw new ConflictException(`Pickup failed. Order is ${order.status}, expected READY`);
      }

      // Execute Transition
      order.status = OrderState.RECEIVED; // Assuming RECEIVED state exists or mapping to COMPLETED flow
      // Note: If RECEIVED is not in Enum, we might use a flag or map to COMPLETED directly based on business rules.
      // Based on invariants, we have RECEIVED state.

      order.version += 1;
      const savedOrder = await queryRunner.manager.save(order);

      // Emit Event (Critical for Audit)
      const event = this.eventRepository.create({
        aggregateId: order.id,
        aggregateType: 'Order',
        eventType: 'ORDER_RECEIVED',
        companyId,
        actorId,
        version: order.version,
        payload: { 
          pickupTime: new Date().toISOString(), // UTC
          method: 'QR_SCAN' 
        }
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
}
