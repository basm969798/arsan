import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async send(userId: string, message: string): Promise<void> {
    console.log(`[NotificationService] Sending to user ${userId}: ${message}`);
  }
}
