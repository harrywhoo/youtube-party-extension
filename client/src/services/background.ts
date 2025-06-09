import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:8080';

let socket: Socket | null = null;
let currentRoom: string | null = null;
let username: string | null = null;
let roomMembers: any[] = [];
let connectionAttempts = 0;
const MAX_RETRIES = 3;

// Initialize socket connection on service worker startup
function initializeSocket() {
    if (socket && socket.connected) {
        console.log('Socket already connected');
        return;
    }
    
    connectionAttempts++;
    console.log(`Initializing socket connection attempt ${connectionAttempts} to ${SERVER_URL}`);
    
    socket = io(SERVER_URL, {
        transports: ['websocket'], // Force websocket transport only, as per user suggestion
        forceNew: true
    });
    
    socket.on('connect', () => {
        console.log('✅ Service worker connected to server:', socket?.id);
        connectionAttempts = 0; // Reset on successful connection
        notifyPopup({ type: 'connection-status', status: 'connected' });
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ Service worker disconnected from server. Reason:', reason);
        notifyPopup({ type: 'connection-status', status: 'disconnected' });
    });

    socket.on('connect_error', (error) => {
        console.error('❌ Service worker connection error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        
        notifyPopup({ type: 'connection-status', status: 'disconnected' });
        
        // Retry connection with exponential backoff
        if (connectionAttempts < MAX_RETRIES) {
            const retryDelay = Math.pow(2, connectionAttempts) * 1000; // 2s, 4s, 8s
            console.log(`Retrying connection in ${retryDelay}ms...`);
            setTimeout(() => {
                initializeSocket();
            }, retryDelay);
        } else {
            console.error('Max connection attempts reached. Giving up.');
        }
    });

    // Room event handlers
    socket.on('room-created', (data) => {
        console.log('Room created:', data);
        currentRoom = data.roomId;
        roomMembers = data.members;
        notifyPopup({ type: 'room-created', data });
    });

    socket.on('room-joined', (data) => {
        console.log('Room joined:', data);
        currentRoom = data.roomId;
        roomMembers = data.members;
        notifyPopup({ type: 'room-joined', data });
    });

    socket.on('room-left', (roomId) => {
        console.log('Room left:', roomId);
        currentRoom = null;
        username = null;
        roomMembers = [];
        notifyPopup({ type: 'room-left', data: roomId });
    });

    socket.on('user-joined', (data) => {
        console.log('User joined room:', data);
        roomMembers = data.members;
        notifyPopup({ type: 'user-joined', data });
    });

    socket.on('user-left', (data) => {
        console.log('User left room:', data);
        roomMembers = data.members;
        notifyPopup({ type: 'user-left', data });
    });

    socket.on('room-error', (error) => {
        console.error('Room error:', error);
        notifyPopup({ type: 'room-error', data: error });
    });

    // Video sync handler
    socket.on('video-sync-received', (data) => {
        console.log('Received video sync:', data);
        // Only apply if it's for our current room and not from ourselves
        if (data.roomId === currentRoom && data.username !== username) {
            broadcastToContentScripts(data);
        }
    });
}

// Helper function to notify popup
function notifyPopup(message: any) {
    chrome.runtime.sendMessage(message).catch(() => {
        // Popup might not be open, ignore error
    });
}

// Broadcast video sync to all YouTube content scripts
function broadcastToContentScripts(syncData: any) {
    chrome.tabs.query({ url: "*://www.youtube.com/watch*" }, (tabs) => {
        tabs.forEach(tab => {
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'incoming-sync',
                    action: syncData.action,
                    time: syncData.time
                }).catch(() => {
                    // Content script might not be loaded, ignore
                });
            }
        });
    });
}

// Extension installation/startup
chrome.runtime.onInstalled.addListener((details) => {
    console.log('YouTube Party Extension installed/updated:', details.reason);
    initializeSocket();
});

// Initialize socket when service worker starts
initializeSocket();

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('Background received message:', message);
    
    switch (message.type) {
        case 'create-room':
            handleCreateRoom(message.username, sendResponse);
            return true;
            
        case 'join-room':
            handleJoinRoom(message.roomId, message.username, sendResponse);
            return true;
            
        case 'leave-room':
            handleLeaveRoom(sendResponse);
            return true;
            
        case 'outgoing-sync':
            handleVideoSync(message);
            break;
            
        case 'get-connection-status':
            sendResponse({ 
                connected: socket?.connected || false,
                currentRoom,
                username,
                roomMembers
            });
            return true;
            
        default:
            console.warn('Unknown message type:', message.type);
    }
});

// Room management functions
function handleCreateRoom(usernameParam: string, sendResponse: (response: any) => void) {
    if (!socket) {
        sendResponse({ success: false, error: 'Not connected to server' });
        return;
    }
    
    username = usernameParam;
    socket.emit('create-room', { username });
    sendResponse({ success: true });
}

function handleJoinRoom(roomId: string, usernameParam: string, sendResponse: (response: any) => void) {
    if (!socket) {
        sendResponse({ success: false, error: 'Not connected to server' });
        return;
    }
    
    username = usernameParam;
    socket.emit('join-room', { roomId, username });
    sendResponse({ success: true });
}

function handleLeaveRoom(sendResponse: (response: any) => void) {
    if (!socket) {
        sendResponse({ success: false, error: 'Not connected to server' });
        return;
    }
    
    socket.emit('leave-room');
    // Don't clear local state immediately - wait for server confirmation via 'room-left' event
    sendResponse({ success: true });
}

// Video sync function
function handleVideoSync(message: any) {
    if (!socket || !currentRoom || !username) {
        console.log('Cannot sync video: not connected or not in room');
        return;
    }
    
    console.log('Sending video sync to server:', message);
    socket.emit('video-sync', {
        roomId: currentRoom,
        action: message.action,
        time: message.time,
        username: username
    });
}

