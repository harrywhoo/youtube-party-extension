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
const roomMembers = new Map(); // roomId -> Set of socketIds
const userRooms = new Map(); // socketId -> roomId (since users can only be in one room)

const corsOptions = {
    origin: [
        "http://localhost:5173",  // Vite dev server
        /^chrome-extension:\/\/.*$/  // Any Chrome extension
    ],
}; 

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON request bodies

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
        console.log(`${socketId} left room ${currentRoom}`);
        return currentRoom;
    }
    return null;
}

// Helper function to add user to room
function joinRoom(socketId, roomId) {
    // First leave current room if any
    leaveCurrentRoom(socketId);
    
    // Add to new room
    if (!roomMembers.has(roomId)) {
        roomMembers.set(roomId, new Set());
    }
    roomMembers.get(roomId).add(socketId);
    userRooms.set(socketId, roomId);
}

io.on("connection", (socket) => {
    console.log(`A user connected from ${socket.id}`);

    // Handle room creation
    socket.on('create-room', () => {
        const roomId = nanoid();
        activeRooms.add(roomId);
        socket.join(roomId);
        joinRoom(socket.id, roomId);
        console.log(`${socket.id} created and joined room ${roomId}`);
        socket.emit('room-created', roomId);
    });

    // Handle joining existing room with validation
    socket.on('join-room', (roomId) => {
        if (!roomId || typeof roomId !== 'string') {
            socket.emit('room-error', 'Invalid room code');
            return;
        }

        if (!activeRooms.has(roomId)) {
            socket.emit('room-error', 'Room does not exist');
            return;
        }

        socket.join(roomId);
        joinRoom(socket.id, roomId);
        console.log(`${socket.id} joined room ${roomId} (${roomMembers.get(roomId).size} users)`);
        socket.emit('room-joined', roomId);
        // Notify others in the room
        socket.to(roomId).emit('user-joined', socket.id);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        // User can only be in one room, so just leave it
        const leftRoom = leaveCurrentRoom(socket.id);
        if (leftRoom) {
            // Notify remaining users in the room
            socket.to(leftRoom).emit('user-left', socket.id);
        }
        
        console.log(`📊 Active rooms: ${activeRooms.size}`);
    });
});

server.listen(8080, () => {
    console.log("Server is running on port 8080");
});

