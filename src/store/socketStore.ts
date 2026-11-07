import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  onlineUsers: string[];
  reconnecting: boolean;
  lastError: string | null;

  // Actions
  connect: (token?: string) => void;
  disconnect: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string, fileUrl?: string) => void;
  sendTyping: (roomId: string) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,
  onlineUsers: [],
  reconnecting: false,
  lastError: null,

  connect: (token?: string) => {
    const existingSocket = get().socket;
    if (existingSocket && existingSocket.connected) return;

    const socketUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    
    const socket = io(socketUrl, {
      auth: { token: token || '' },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      randomizationFactor: 0.5,
    });

    socket.on('connect', () => {
      set({ connected: true, reconnecting: false, lastError: null });
    });

    socket.on('connect_success', (data: { onlineUsers?: string[] }) => {
      if (data.onlineUsers) {
        set({ onlineUsers: data.onlineUsers });
      }
    });

    socket.on('presence:online', ({ userId }: { userId: string }) => {
      set((state) => ({
        onlineUsers: Array.from(new Set([...state.onlineUsers, userId])),
      }));
    });

    socket.on('presence:offline', ({ userId }: { userId: string }) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.filter((id) => id !== userId),
      }));
    });

    socket.on('reconnect_attempt', () => {
      set({ reconnecting: true });
    });

    socket.on('connect_error', (err) => {
      set({ lastError: err.message || 'فشل الاتصال بالخادم المباشر', reconnecting: false });
    });

    socket.on('disconnect', () => {
      set({ connected: false });
    });

    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false, onlineUsers: [] });
    }
  },

  joinRoom: (roomId: string) => {
    const socket = get().socket;
    if (socket && roomId) {
      socket.emit('chat:join', { roomId });
    }
  },

  leaveRoom: (roomId: string) => {
    const socket = get().socket;
    if (socket && roomId) {
      socket.emit('chat:leave', { roomId });
    }
  },

  sendMessage: (roomId: string, content: string, fileUrl?: string) => {
    const socket = get().socket;
    if (socket && roomId && content) {
      socket.emit('chat:message', { roomId, content, fileUrl });
    }
  },

  sendTyping: (roomId: string) => {
    const socket = get().socket;
    if (socket && roomId) {
      socket.emit('chat:typing', { roomId });
    }
  },
}));
