import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[NotificationGateway] Client connected: ${client.id}`);
  }

  @SubscribeMessage('joinCompany')
  handleJoinCompany(@MessageBody() data: { companyId: string }, @ConnectedSocket() client: Socket) {
    client.join(data.companyId);
    console.log(`[NotificationGateway] Client ${client.id} joined company room: ${data.companyId}`);
    return { event: 'joined', data: data.companyId };
  }

  sendToCompany(companyId: string, message: string) {
    this.server.to(companyId).emit('notification', { message, timestamp: new Date() });
    console.log(`[NotificationGateway] Push sent to company: ${companyId}`);
  }
}
