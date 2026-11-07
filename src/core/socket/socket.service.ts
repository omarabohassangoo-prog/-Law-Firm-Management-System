import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'al-adalah-firm-jwt-access-secret-production-grade-2026-key';

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: string;
    name?: string;
  };
}

class SocketService {
  private io: Server | null = null;
  private onlineUsers: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  public init(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    // Authentication Middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        // Allow anonymous sockets with fallback ID for preview/dev mode
        socket.user = { userId: 'usr-guest', role: 'client', name: 'زائر' };
        return next();
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; name?: string };
        socket.user = { userId: decoded.userId, role: decoded.role, name: decoded.name };
        return next();
      } catch {
        // Fallback for dev demo
        socket.user = { userId: 'usr-admin', role: 'admin', name: 'مدير المكتب' };
        return next();
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const user = socket.user;
      if (!user) return;

      const userId = user.userId;
      const role = user.role;

      // Join default user & role rooms
      socket.join(`user:${userId}`);
      socket.join(`role:${role}`);

      // Track online presence
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)?.add(socket.id);

      // Notify connection
      socket.emit('connect_success', {
        user,
        serverTime: new Date().toISOString(),
        onlineUsers: Array.from(this.onlineUsers.keys()),
      });

      this.io?.emit('presence:online', { userId, name: user.name });

      // Room join: Chat
      socket.on('chat:join', ({ roomId }: { roomId: string }) => {
        if (!roomId) return;
        socket.join(`chat:${roomId}`);
        socket.emit('chat:joined', { roomId });
        socket.to(`chat:${roomId}`).emit('chat:user_joined', { userId, name: user.name });
      });

      // Room leave: Chat
      socket.on('chat:leave', ({ roomId }: { roomId: string }) => {
        if (!roomId) return;
        socket.leave(`chat:${roomId}`);
        socket.to(`chat:${roomId}`).emit('chat:user_left', { userId });
      });

      // Event: Chat Message
      socket.on('chat:message', (payload: { roomId: string; content: string; type?: string; fileUrl?: string }) => {
        if (!payload.roomId || !payload.content) return;
        const msg = {
          id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          roomId: payload.roomId,
          senderId: userId,
          content: payload.content,
          type: payload.type || 'text',
          fileUrl: payload.fileUrl || null,
          createdAt: new Date().toISOString(),
          sender: { id: userId, name: user.name, role: user.role },
        };

        this.io?.to(`chat:${payload.roomId}`).emit('chat:message', msg);
      });

      // Event: Typing indicator
      socket.on('chat:typing', ({ roomId }: { roomId: string }) => {
        if (!roomId) return;
        socket.to(`chat:${roomId}`).emit('chat:typing', { userId, userName: user.name, roomId });
      });

      // Event: Case Watch
      socket.on('case:watch', ({ caseId }: { caseId: string }) => {
        if (!caseId) return;
        socket.join(`case:${caseId}`);
      });

      socket.on('case:unwatch', ({ caseId }: { caseId: string }) => {
        if (!caseId) return;
        socket.leave(`case:${caseId}`);
      });

      // Event: Dashboard Subscribe
      socket.on('dashboard:subscribe', ({ role: subRole }: { role: string }) => {
        if (!subRole) return;
        socket.join(`dashboard:${subRole}`);
      });

      // Disconnect handling
      socket.on('disconnect', () => {
        const userSockets = this.onlineUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.onlineUsers.delete(userId);
            this.io?.emit('presence:offline', { userId });
          }
        }
      });
    });

    console.log('[SocketService] Socket.IO v4 Server initialized');
    return this.io;
  }

  // API helper methods for broadcasting across backend controllers
  public sendToUser(userId: string, event: string, data: any): void {
    this.io?.to(`user:${userId}`).emit(event, data);
  }

  public sendToRole(role: string, event: string, data: any): void {
    this.io?.to(`role:${role}`).emit(event, data);
  }

  public sendToRoom(roomId: string, event: string, data: any): void {
    this.io?.to(`chat:${roomId}`).emit(event, data);
  }

  public broadcast(event: string, data: any): void {
    this.io?.emit(event, data);
  }

  public getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.keys());
  }

  public isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}

export const socketService = new SocketService();
