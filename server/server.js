// Removed nanoid dependency - using custom room code generator
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");  

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: [
            "http://localhost:5173",  // Vite dev server
            /^chrome-extension:\/\/.*$/  // Any Chrome extension
        ],
        methods: ["GET", "POST"]
    }
});

// Track active rooms and their members
const activeRooms = new Set();
const roomMembers = new Map(); // roomId -> Map of socketId -> username
const userRooms = new Map(); // socketId -> roomId (since users can only be in one room)
const usernames = new Map(); // socketId -> username

// Generate 6-character uppercase room code
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Generate unique room code (ensure no collisions)
function generateUniqueRoomCode() {
    let code;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop
    
    do {
        code = generateRoomCode();
        attempts++;
    } while (activeRooms.has(code) && attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique room code');
    }
    
    return code;
}

const corsOptions = {
    origin: [
        "http://localhost:5173",  // Vite dev server
        /^chrome-extension:\/\/.*$/  // Any Chrome extension
    ],
}; 

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON request bodies

// Helper function to get room members array
function getRoomMembersArray(roomId) {
    if (!roomMembers.has(roomId)) return [];
    
    const members = [];
    roomMembers.get(roomId).forEach((username, socketId) => {
        members.push({ socketId, username });
    });
    return members;
}

// Helper function to remove user from their current room
function leaveCurrentRoom(socketId) {
    const currentRoom = userRooms.get(socketId);
    if (currentRoom) {
        // Remove from room members
        if (roomMembers.has(currentRoom)) {
            roomMembers.get(currentRoom).delete(socketId);
            
            // If room is now empty, clean it up
            if (roomMembers.get(currentRoom).size === 0) {
                roomMembers.delete(currentRoom);
                activeRooms.delete(currentRoom);
                console.log(`🧹 Cleaned up empty room: ${currentRoom}`);
            }
        }
        
        // Remove user's room tracking
        userRooms.delete(socketId);
        usernames.delete(socketId);
        console.log(`${socketId} left room ${currentRoom}`);
        return currentRoom;
    }
    return null;
}

// Helper function to add user to room
function joinRoom(socketId, roomId, username) {
    // First leave current room if any
    leaveCurrentRoom(socketId);
    
    // Add to new room
    if (!roomMembers.has(roomId)) {
        roomMembers.set(roomId, new Map());
    }
    roomMembers.get(roomId).set(socketId, username);
    userRooms.set(socketId, roomId);
    usernames.set(socketId, username);
}

io.on("connection", (socket) => {
    console.log(`A user connected from ${socket.id}`);

    // Handle room creation
    socket.on('create-room', (data) => {
        const { username } = data;
        
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            socket.emit('room-error', 'Valid username is required');
            return;
        }
        
        try {
            const roomId = generateUniqueRoomCode();
            activeRooms.add(roomId);
            socket.join(roomId);
            joinRoom(socket.id, roomId, username.trim());
            console.log(`${socket.id} (${username}) created and joined room ${roomId}`);
            
            const members = getRoomMembersArray(roomId);
            socket.emit('room-created', { roomId, members });
        } catch (error) {
            console.error('Failed to create room:', error);
            socket.emit('room-error', 'Failed to create room. Please try again.');
        }
    });

    // Handle joining existing room with validation
    socket.on('join-room', (data) => {
        const { roomId, username } = data;
        
        // Validate username
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            socket.emit('room-error', 'Valid username is required');
            return;
        }
        
        // Validate room code format (6 uppercase alphanumeric)
        if (!roomId || typeof roomId !== 'string') {
            socket.emit('room-error', 'Invalid room code format');
            return;
        }
        
        const cleanRoomId = roomId.trim().toUpperCase();
        if (!/^[A-Z0-9]{6}$/.test(cleanRoomId)) {
            socket.emit('room-error', 'Room code must be 6 characters (letters and numbers only)');
            return;
        }

        if (!activeRooms.has(cleanRoomId)) {
            socket.emit('room-error', 'Room does not exist');
            return;
        }

        socket.join(cleanRoomId);
        joinRoom(socket.id, cleanRoomId, username.trim());
        console.log(`${socket.id} (${username}) joined room ${cleanRoomId} (${roomMembers.get(cleanRoomId).size} users)`);
        
        const members = getRoomMembersArray(cleanRoomId);
        socket.emit('room-joined', { roomId: cleanRoomId, members });
        
        // Notify others in the room
        socket.to(cleanRoomId).emit('user-joined', { userId: socket.id, username: username.trim(), members });
    });

    // Handle manual room leaving
    socket.on('leave-room', () => {
        console.log(`${socket.id} manually leaving room`);
        
        const leftRoom = leaveCurrentRoom(socket.id);
        if (leftRoom) {
            // Leave socket.io room
            socket.leave(leftRoom);
            
            // Notify remaining users in the room
            const members = getRoomMembersArray(leftRoom);
            socket.to(leftRoom).emit('user-left', { userId: socket.id, members });
            
            // Confirm to the user that they left
            socket.emit('room-left', leftRoom);
            console.log(`${socket.id} successfully left room ${leftRoom}`);
        }
        
        console.log(`📊 Active rooms: ${activeRooms.size}`);
    });

    // Handle video synchronization
    socket.on('video-sync', (data) => {
        const { roomId, action, time, username } = data;
        console.log(`📹 Video sync from ${socket.id} (${username}): ${action} at ${time}s in room ${roomId}`);
        
        // Validate that user is in the room they're trying to sync
        const userRoom = userRooms.get(socket.id);
        if (userRoom !== roomId) {
            console.warn(`❌ ${socket.id} tried to sync video in room ${roomId} but is in room ${userRoom || 'none'}`);
            return;
        }
        
        // Broadcast to all other users in the room (excluding sender)
        const roomMemberCount = roomMembers.get(roomId)?.size || 0;
        socket.to(roomId).emit('video-sync-received', {
            roomId,
            action,
            time,
            username
        });
        
        console.log(`📡 Broadcasted video sync to room ${roomId}: ${action} at ${time}s`);
        console.log(`📊 Sent to ${roomMemberCount - 1} other users (excluding sender ${socket.id})`);
        
        // Debug: List who should receive this
        if (roomMembers.has(roomId)) {
            console.log('👥 Room members:');
            roomMembers.get(roomId).forEach((memberUsername, memberSocketId) => {
                const isSender = memberSocketId === socket.id;
                console.log(`   - ${memberSocketId} (${memberUsername}) ${isSender ? '← SENDER (excluded)' : '← will receive'}`);
            });
        }
    });

    // Handle URL synchronization
    socket.on('url-sync', (data) => {
        const { roomId, videoId, url, username } = data;
        console.log(`📺 URL sync from ${socket.id} (${username}): video ${videoId} in room ${roomId}`);
        
        // Validate that user is in the room they're trying to sync
        const userRoom = userRooms.get(socket.id);
        if (userRoom !== roomId) {
            console.warn(`❌ ${socket.id} tried to sync URL in room ${roomId} but is in room ${userRoom || 'none'}`);
            return;
        }
        
        // Broadcast to all other users in the room
        socket.to(roomId).emit('url-sync-received', {
            roomId,
            videoId,
            url,
            username
        });
        
        console.log(`📡 Broadcasted URL sync to room ${roomId}: video ${videoId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        // User can only be in one room, so just leave it
        const leftRoom = leaveCurrentRoom(socket.id);
        if (leftRoom) {
            // Notify remaining users in the room
            const members = getRoomMembersArray(leftRoom);
            socket.to(leftRoom).emit('user-left', { userId: socket.id, members });
        }
        
        console.log(`📊 Active rooms: ${activeRooms.size}`);
    });
});

server.listen(8080, () => {
    console.log("Server is running on port 8080");
});

