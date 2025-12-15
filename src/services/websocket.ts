import { io, Socket } from 'socket.io-client';
import type { Guest, PosOrder } from './api';

const WS_URL = 'http://localhost:5000';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected');
    });

    // Guest events
    this.socket.on('guest:created', (guest: Guest) => {
      this.emit('guest:created', guest);
    });

    this.socket.on('guest:updated', (guest: Guest) => {
      this.emit('guest:updated', guest);
    });

    this.socket.on('guest:deleted', (data: { _id: string }) => {
      this.emit('guest:deleted', data._id);
    });

    // Order events
    this.socket.on('order:created', (order: PosOrder) => {
      this.emit('order:created', order);
    });

    this.socket.on('order:updated', (order: PosOrder) => {
      this.emit('order:updated', order);
    });

    this.socket.on('order:deleted', (data: { _id: string }) => {
      this.emit('order:deleted', data._id);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  requestSync(collection?: 'guests' | 'orders' | 'all') {
    if (this.socket?.connected) {
      this.socket.emit('sync:request', { collection: collection || 'all' });
    }
  }
}

export const wsService = new WebSocketService();

