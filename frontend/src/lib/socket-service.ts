import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (companyId: string) => {
  if (!socket) {
    socket = io('http://localhost:8080');
    socket.on('connect', () => {
      console.log('Connected to Real-time Server');
      socket?.emit('joinCompany', { companyId });
    });

    socket.on('notification', (data) => {
      alert(`تنبيه جديد: ${data.message}`);
    });
  }
  return socket;
};
