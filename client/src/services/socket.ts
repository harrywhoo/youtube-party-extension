import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:8080';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SERVER_URL);
      
      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }
    
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Room methods - now using Socket.IO events
  createRoom(username: string): void {
    if (this.socket) {
      this.socket.emit('create-room', { username });
    }
  }

  joinRoom(roomId: string, username: string): void {
    if (this.socket) {
      this.socket.emit('join-room', { roomId, username });
    }
  }

  leaveRoom(): void {
    if (this.socket) {
      this.socket.emit('leave-room');
    }
  }

  // Event listeners
  onRoomCreated(callback: (data: { roomId: string, members: any[] }) => void): void {
    if (this.socket) {
      this.socket.on('room-created', callback);
    }
  }

  onRoomJoined(callback: (data: { roomId: string, members: any[] }) => void): void {
    if (this.socket) {
      this.socket.on('room-joined', callback);
    }
  }

  onRoomLeft(callback: (roomId: string) => void): void {
    if (this.socket) {
      this.socket.on('room-left', callback);
    }
  }

  onUserJoined(callback: (data: { userId: string, username: string, members: any[] }) => void): void {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback: (data: { userId: string, members: any[] }) => void): void {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  onRoomError(callback: (error: string) => void): void {
    if (this.socket) {
      this.socket.on('room-error', callback);
    }
  }

  // Clean up event listeners
  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketService = new SocketService(); 