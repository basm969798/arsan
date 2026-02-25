import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './domain/entities/notification.entity';
import { NotificationsService } from './application/services/notifications.service';
import { NotificationGateway } from './infrastructure/gateways/notification.gateway';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [NotificationsService, NotificationGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}
