import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

let socket: Socket | null = null;

export const initSocket = (companyId: string) => {
  if (!socket) {
    socket = io('http://localhost:8080');

    socket.on('connect', () => {
      console.log('Connected to Arsan Real-time Hub');
      socket?.emit('joinCompany', { companyId });
    });

    socket.on('notification', (data) => {
      toast.success(data.message, {
        duration: 4000,
        position: 'top-left',
        icon: '\\u{1F514}',
        style: { direction: 'rtl', borderRadius: '10px', background: '#333', color: '#fff' }
      });

      window.dispatchEvent(new Event('new-notification'));
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Disconnected from Real-time Hub');
  }
};
