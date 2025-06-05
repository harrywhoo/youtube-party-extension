// Socket service types and constants
// Actual socket connection is now handled in background.ts service worker

export const SERVER_URL = 'http://localhost:8080';

// Types for room data
export interface Member {
  socketId: string;
  username: string;
}

export interface RoomData {
  roomId: string;
  members: Member[];
}

export interface VideoSyncData {
  roomId: string;
  action: 'play' | 'pause' | 'seek';
  time: number;
  username: string;
}

// Helper to check if we're in a Chrome extension environment
const isExtensionEnvironment = () => {
  return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage;
};

// Helper class to communicate with background service worker
class BackgroundSocketService {
  
  // Room methods - these now send messages to background
  createRoom(username: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!isExtensionEnvironment()) {
        reject('Not running in Chrome extension environment');
        return;
      }
      
      chrome.runtime.sendMessage({ 
        type: 'create-room', 
        username 
      }, (response) => {
        if (response?.success) {
          resolve(response);
        } else {
          reject(response?.error || 'Failed to create room');
        }
      });
    });
  }

  joinRoom(roomId: string, username: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!isExtensionEnvironment()) {
        reject('Not running in Chrome extension environment');
        return;
      }
      
      chrome.runtime.sendMessage({ 
        type: 'join-room', 
        roomId, 
        username 
      }, (response) => {
        if (response?.success) {
          resolve(response);
        } else {
          reject(response?.error || 'Failed to join room');
        }
      });
    });
  }

  leaveRoom(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!isExtensionEnvironment()) {
        reject('Not running in Chrome extension environment');
        return;
      }
      
      chrome.runtime.sendMessage({ 
        type: 'leave-room' 
      }, (response) => {
        if (response?.success) {
          resolve(response);
        } else {
          reject(response?.error || 'Failed to leave room');
        }
      });
    });
  }

  // Get current connection status from background
  getConnectionStatus(): Promise<any> {
    return new Promise((resolve) => {
      if (!isExtensionEnvironment()) {
        resolve({ connected: false, error: 'Not in extension environment' });
        return;
      }
      
      chrome.runtime.sendMessage({ 
        type: 'get-connection-status' 
      }, (response) => {
        resolve(response || { connected: false });
      });
    });
  }
}

export const socketService = new BackgroundSocketService(); 