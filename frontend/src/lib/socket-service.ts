import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

let socket: Socket | null = null;

function getSocketURL() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080';
    }
    return window.location.origin;
  }
  return 'http://localhost:8080';
}

export const initSocket = (companyId: string) => {
  if (!socket) {
    socket = io(getSocketURL(), { path: '/socket.io' });

    socket.on('connect', () => {
      console.log('Connected to Arsan Real-time Hub');
      socket?.emit('joinCompany', { companyId });
    });

    socket.on('notification', (data) => {
      toast.success(data.message, {
        duration: 4000,
        position: 'top-left',
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
