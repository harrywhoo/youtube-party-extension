const { nanoid } = require("nanoid");
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
        const roomId = nanoid();
        activeRooms.add(roomId);
        socket.join(roomId);
        joinRoom(socket.id, roomId, username);
        console.log(`${socket.id} (${username}) created and joined room ${roomId}`);
        
        const members = getRoomMembersArray(roomId);
        socket.emit('room-created', { roomId, members });
    });

    // Handle joining existing room with validation
    socket.on('join-room', (data) => {
        const { roomId, username } = data;
        
        if (!roomId || typeof roomId !== 'string') {
            socket.emit('room-error', 'Invalid room code');
            return;
        }

        if (!activeRooms.has(roomId)) {
            socket.emit('room-error', 'Room does not exist');
            return;
        }

        socket.join(roomId);
        joinRoom(socket.id, roomId, username);
        console.log(`${socket.id} (${username}) joined room ${roomId} (${roomMembers.get(roomId).size} users)`);
        
        const members = getRoomMembersArray(roomId);
        socket.emit('room-joined', { roomId, members });
        
        // Notify others in the room
        socket.to(roomId).emit('user-joined', { userId: socket.id, username, members });
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

