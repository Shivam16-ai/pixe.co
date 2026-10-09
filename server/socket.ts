import type { Server as HttpServer } from 'node:http';

import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || '';
const normalizeOrigin = (value: string) => value.replace(/\/$/, '');
const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    process.env.APP_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeOrigin)
);

let socketServer: Server | null = null;

type SocketUser = {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
};

export function setSocketServer(io: Server) {
  socketServer = io;
}

export function getSocketServer() {
  return socketServer;
}

function parseCookieValue(rawCookieHeader: string | undefined, key: string): string | null {
  if (!rawCookieHeader) {
    return null;
  }

  for (const entry of rawCookieHeader.split(';')) {
    const [name, ...rest] = entry.trim().split('=');
    if (name === key) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
}

function emitToAdmin(io: Server, event: string, payload: Record<string, unknown>) {
  io.to('admin').emit(event, payload);
}

type InventoryEventPayload = {
  productId: string;
  stockQuantity: number;
  updatedAt: string;
  productName?: string;
};

export function emitOrderCreated(
  io: Server,
  payload: {
    orderId: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }
) {
  emitToAdmin(io, 'order.created', payload);
  io.to(`user:${payload.customerId}`).emit('order.created', payload);
}

export function emitOrderStatusUpdated(
  io: Server,
  payload: {
    orderId: string;
    orderNumber: string;
    customerId: string;
    status: string;
    updatedAt: string;
  }
) {
  emitToAdmin(io, 'order.status.updated', payload);
  io.to(`user:${payload.customerId}`).emit('order.status.updated', payload);
  io.to(`order:${payload.orderId}`).emit('order.status.updated', payload);
}

export function emitInventoryUpdated(io: Server, payload: InventoryEventPayload) {
  emitToAdmin(io, 'inventory.updated', payload);
}

export function emitInventoryLow(io: Server, payload: InventoryEventPayload & { productName: string; remaining: number }) {
  emitToAdmin(io, 'inventory.low', payload);
}

export function emitInventoryOut(io: Server, payload: InventoryEventPayload & { productName: string; remaining: number }) {
  emitToAdmin(io, 'inventory.out', payload);
}

export function emitProductUpdated(
  io: Server,
  payload: { productId: string; title: string; price: number; stockQuantity: number; updatedAt: string; image?: string | null }
) {
  io.emit('product.updated', payload);
}

export function attachSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }

        const normalized = normalizeOrigin(origin);
        if (allowedOrigins.has(normalized)) {
          return callback(null, true);
        }

        if (process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }

        return callback(new Error('Origin not allowed by WebSocket CORS policy'));
      },
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use(async (socket, next) => {
    try {
      const rawCookieHeader = socket.handshake.headers.cookie;
      const token = parseCookieValue(rawCookieHeader, 'pixe_auth_token');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id?: string; role?: string; email?: string };
      if (!decoded?.id) {
        return next(new Error('Invalid session'));
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true },
      });

      if (!dbUser) {
        return next(new Error('User not found'));
      }

      const role = dbUser.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

      socket.data.user = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role,
      } satisfies SocketUser;

      return next();
    } catch {
      return next(new Error('Invalid or expired session'));
    }
  });

  io.on('connection', (socket) => {
    const socketUser = socket.data.user as SocketUser | undefined;

    if (!socketUser) {
      socket.disconnect(true);
      return;
    }

    if (socketUser.role === 'ADMIN') {
      socket.join('admin');
    } else {
      socket.join(`user:${socketUser.id}`);
    }

    socket.on('order:join', async (payload: { orderId?: string } = {}) => {
      const { orderId } = payload;
      if (!orderId || typeof orderId !== 'string') {
        return;
      }

      if (socketUser.role === 'ADMIN') {
        socket.join(`order:${orderId}`);
        socket.emit('order:room:joined', { orderId });
        return;
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { userId: true },
      });

      if (!order || order.userId !== socketUser.id) {
        socket.emit('order:room:denied', { orderId, message: 'Order room access denied.' });
        return;
      }

      socket.join(`order:${orderId}`);
      socket.emit('order:room:joined', { orderId });
    });
  });

  setSocketServer(io);
  return io;
}
