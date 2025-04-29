const { Server } = require('socket.io');
const wrtc = require('wrtc');

class WebRTCService {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || '*',
                methods: ['GET', 'POST']
            }
        });

        this.rooms = new Map();
        this.peerConnections = new Map();

        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('join-room', async (data) => {
                const { roomId, userId, userType } = data;

                // Join the room
                socket.join(roomId);
                socket.roomId = roomId;
                socket.userId = userId;
                socket.userType = userType;

                // Initialize room if it doesn't exist
                if (!this.rooms.has(roomId)) {
                    this.rooms.set(roomId, new Set());
                }
                this.rooms.get(roomId).add(socket.id);

                // Notify others in the room
                socket.to(roomId).emit('user-connected', {
                    userId,
                    userType
                });

                // Send current participants to the new user
                const participants = [];
                this.rooms.get(roomId).forEach(participantId => {
                    if (participantId !== socket.id) {
                        const participant = this.io.sockets.sockets.get(participantId);
                        if (participant) {
                            participants.push({
                                socketId: participantId,
                                userId: participant.userId,
                                userType: participant.userType
                            });
                        }
                    }
                });

                socket.emit('room-users', participants);
            });

            socket.on('offer', async (data) => {
                const { targetId, description } = data;
                socket.to(targetId).emit('offer', {
                    from: socket.id,
                    description
                });
            });

            socket.on('answer', (data) => {
                const { targetId, description } = data;
                socket.to(targetId).emit('answer', {
                    from: socket.id,
                    description
                });
            });

            socket.on('ice-candidate', (data) => {
                const { targetId, candidate } = data;
                socket.to(targetId).emit('ice-candidate', {
                    from: socket.id,
                    candidate
                });
            });

            socket.on('chat-message', (data) => {
                const { roomId, message } = data;
                this.io.to(roomId).emit('chat-message', {
                    userId: socket.userId,
                    userType: socket.userType,
                    message,
                    timestamp: new Date()
                });
            });

            socket.on('toggle-media', (data) => {
                const { roomId, audio, video } = data;
                socket.to(roomId).emit('user-media-toggle', {
                    userId: socket.userId,
                    audio,
                    video
                });
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);

                if (socket.roomId && this.rooms.has(socket.roomId)) {
                    // Remove from room
                    this.rooms.get(socket.roomId).delete(socket.id);

                    // Notify others
                    socket.to(socket.roomId).emit('user-disconnected', {
                        userId: socket.userId
                    });

                    // Clean up room if empty
                    if (this.rooms.get(socket.roomId).size === 0) {
                        this.rooms.delete(socket.roomId);
                    }
                }

                // Clean up peer connection
                if (this.peerConnections.has(socket.id)) {
                    this.peerConnections.get(socket.id).close();
                    this.peerConnections.delete(socket.id);
                }
            });
        });
    }

    // Get room statistics
    getRoomStats() {
        const stats = {
            totalRooms: this.rooms.size,
            totalConnections: this.io.sockets.sockets.size,
            rooms: []
        };

        this.rooms.forEach((participants, roomId) => {
            stats.rooms.push({
                roomId,
                participants: participants.size
            });
        });

        return stats;
    }

    // Close a specific room
    closeRoom(roomId) {
        if (this.rooms.has(roomId)) {
            // Notify all participants
            this.io.to(roomId).emit('room-closed', {
                message: 'This consultation has been ended by the doctor'
            });

            // Disconnect all participants
            this.rooms.get(roomId).forEach(socketId => {
                const socket = this.io.sockets.sockets.get(socketId);
                if (socket) {
                    socket.leave(roomId);
                    if (this.peerConnections.has(socketId)) {
                        this.peerConnections.get(socketId).close();
                        this.peerConnections.delete(socketId);
                    }
                }
            });

            // Remove room
            this.rooms.delete(roomId);
        }
    }
}

module.exports = WebRTCService;