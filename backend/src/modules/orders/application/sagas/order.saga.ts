import { Injectable, OnModuleInit } from '@nestjs/common';
import { DomainEventBus } from '../../../../common/events/domain-event.bus';
import { NotificationsService } from '../../../notifications/application/services/notifications.service';
import { SearchService } from '../../../search/application/services/search.service';

@Injectable()
export class OrderSaga implements OnModuleInit {
  constructor(
    private readonly eventBus: DomainEventBus,
    private readonly notifications: NotificationsService,
    private readonly search: SearchService,
  ) {}

  onModuleInit() {
    this.eventBus.on('ORDER_CREATED', (payload) => this.handleOrderCreated(payload));
    console.log('[OrderSaga] Process Manager Initialized and Listening...');
  }

  async handleOrderCreated(payload: any) {
    console.log(`[OrderSaga] Handling ORDER_CREATED for Order: ${payload.orderId}`);

    await this.notifications.send(payload.companyId, 'A new order has been created.');
    await this.search.indexPart({ id: payload.orderId, type: 'order' });
  }
}
