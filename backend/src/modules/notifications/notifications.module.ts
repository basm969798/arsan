import { Module, Global } from '@nestjs/common';
import { NotificationsService } from './application/services/notifications.service';
import { NotificationsController } from './api/controllers/notifications.controller';

@Global()
@Module({
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
