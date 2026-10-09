import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from './config';

let socket: Socket | null = null;

export function getSocket() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!socket || socket.disconnected) {
    socket = io(API_BASE_URL || window.location.origin, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
