import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationGateway } from '../../infrastructure/gateways/notification.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly gateway: NotificationGateway,
  ) {}

  async send(companyId: string, message: string): Promise<void> {
    const notification = this.notificationRepo.create({ companyId, message });
    await this.notificationRepo.save(notification);

    this.gateway.sendToCompany(companyId, message);
  }
}
