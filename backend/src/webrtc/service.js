const socket = require('socket.io');
const { redisClient } = require('./utils/redisClient');

/**
 * WebRTC Service for handling real-time video consultations
 */
class WebRTCService {
    /**
     * Initialize WebRTC service with Express server
     * @param {Object} server - HTTP server instance
     */
    constructor(server) {
        this.io = socket(server, {
            cors: {
                origin: process.env.FRONTEND_URL || '*',
                methods: ['GET', 'POST'],
                credentials: true
            },
            path: '/socket.io'
        });

        this.rooms = new Map();
        this.setupSocketHandlers();

        console.log('WebRTC service initialized');
    }

    /**
     * Set up socket event handlers
     */
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`Socket connected: ${socket.id}`);

            // Store user information
            socket.on('register', async (data) => {
                try {
                    const { userId, userType, appointmentId } = data;

                    if (!userId || !userType || !appointmentId) {
                        socket.emit('error', { message: 'Missing required data' });
                        return;
                    }

                    // Store user info in socket
                    socket.userId = userId;
                    socket.userType = userType; // 'doctor' or 'patient'
                    socket.appointmentId = appointmentId;

                    // Join room based on appointment ID
                    socket.join(appointmentId);

                    // Store socket info in Redis for recovery after server restart
                    await redisClient.hSet(`socket:${socket.id}`, {
                        userId,
                        userType,
                        appointmentId
                    });

                    // Add user to room tracking
                    if (!this.rooms.has(appointmentId)) {
                        this.rooms.set(appointmentId, new Set());
                    }
                    this.rooms.get(appointmentId).add(socket.id);

                    // Notify user of successful registration
                    socket.emit('registered', {
                        success: true,
                        message: 'Successfully registered for consultation'
                    });

                    // Notify room that new user joined
                    this.io.to(appointmentId).emit('user-joined', {
                        userId,
                        userType
                    });

                    // Get room participants
                    const participants = [];
                    this.rooms.get(appointmentId).forEach(socketId => {
                        if (socketId !== socket.id) {
                            const participantSocket = this.io.sockets.sockets.get(socketId);
                            if (participantSocket) {
                                participants.push({
                                    userId: participantSocket.userId,
                                    userType: participantSocket.userType
                                });
                            }
                        }
                    });

                    // Send room status (empty or doctor/patient already waiting)
                    socket.emit('room-status', {
                        appointmentId,
                        participants
                    });
                } catch (error) {
                    console.error('Error during registration:', error);
                    socket.emit('error', { message: 'Registration failed' });
                }
            });

            // Signaling - pass WebRTC signaling data between peers
            socket.on('signal', (data) => {
                const { appointmentId, signal, targetUserId } = data;

                if (!appointmentId || !signal) {
                    socket.emit('error', { message: 'Missing required data' });
                    return;
                }

                // If target user specified, send only to them, otherwise broadcast to room
                if (targetUserId) {
                    // Find target user socket
                    let targetSocket;
                    this.rooms.get(appointmentId)?.forEach(socketId => {
                        const s = this.io.sockets.sockets.get(socketId);
                        if (s && s.userId === targetUserId) {
                            targetSocket = s;
                        }
                    });

                    // Send signal to target user
                    if (targetSocket) {
                        targetSocket.emit('signal', {
                            signal,
                            userId: socket.userId,
                            userType: socket.userType
                        });
                    } else {
                        socket.emit('error', { message: 'Target user not found' });
                    }
                } else {
                    // Broadcast to all other users in room
                    socket.to(appointmentId).emit('signal', {
                        signal,
                        userId: socket.userId,
                        userType: socket.userType
                    });
                }
            });

            // Chat messaging within consultation
            socket.on('chat-message', (data) => {
                const { appointmentId, message } = data;

                if (!appointmentId || !message) {
                    socket.emit('error', { message: 'Missing required data' });
                    return;
                }

                // Broadcast message to room
                this.io.to(appointmentId).emit('chat-message', {
                    userId: socket.userId,
                    userType: socket.userType,
                    message,
                    timestamp: new Date().toISOString()
                });
            });

            // User toggled audio/video
            socket.on('media-toggle', (data) => {
                const { appointmentId, video, audio } = data;

                if (!appointmentId || video === undefined || audio === undefined) {
                    socket.emit('error', { message: 'Missing required data' });
                    return;
                }

                // Broadcast media state to others in room
                socket.to(appointmentId).emit('media-toggle', {
                    userId: socket.userId,
                    userType: socket.userType,
                    video,
                    audio
                });
            });

            // Screen sharing
            socket.on('screen-share-toggle', (data) => {
                const { appointmentId, sharing } = data;

                if (!appointmentId || sharing === undefined) {
                    socket.emit('error', { message: 'Missing required data' });
                    return;
                }

                // Broadcast screen sharing state to room
                socket.to(appointmentId).emit('screen-share-toggle', {
                    userId: socket.userId,
                    userType: socket.userType,
                    sharing
                });
            });

            // Consultation controls (doctors only)
            socket.on('consultation-control', (data) => {
                const { appointmentId, action } = data;

                if (!appointmentId || !action) {
                    socket.emit('error', { message: 'Missing required data' });
                    return;
                }

                // Only doctors can control consultation
                if (socket.userType !== 'doctor') {
                    socket.emit('error', { message: 'Unauthorized to control consultation' });
                    return;
                }

                // Broadcast control action to room
                this.io.to(appointmentId).emit('consultation-control', {
                    action,
                    timestamp: new Date().toISOString()
                });
            });

            // End consultation (doctors only)
            socket.on('end-consultation', async (data) => {
                const { appointmentId, summary } = data;

                if (!appointmentId) {
                    socket.emit('error', { message: 'Missing required data' });
                    return;
                }

                // Only doctors can end consultation
                if (socket.userType !== 'doctor') {
                    socket.emit('error', { message: 'Unauthorized to end consultation' });
                    return;
                }

                try {
                    // Update appointment status in database
                    if (summary) {
                        const Appointment = require('./appointment/model');
                        const appointment = await Appointment.findById(appointmentId);

                        if (appointment) {
                            appointment.status = 'completed';
                            appointment.consultationSummary = summary;
                            await appointment.save();
                        }
                    }

                    // Broadcast consultation end to room
                    this.io.to(appointmentId).emit('consultation-ended', {
                        message: 'Consultation has ended',
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    console.error('Error ending consultation:', error);
                    socket.emit('error', { message: 'Failed to end consultation' });
                }
            });

            // User disconnected
            socket.on('disconnect', () => {
                try {
                    const { appointmentId, userId, userType } = socket;

                    // Remove from room tracking
                    if (appointmentId && this.rooms.has(appointmentId)) {
                        this.rooms.get(appointmentId).delete(socket.id);

                        // Delete room if empty
                        if (this.rooms.get(appointmentId).size === 0) {
                            this.rooms.delete(appointmentId);
                        } else {
                            // Notify room that user left
                            this.io.to(appointmentId).emit('user-left', {
                                userId,
                                userType
                            });
                        }
                    }

                    // Remove socket info from Redis
                    redisClient.del(`socket:${socket.id}`).catch(err => {
                        console.error('Error removing socket from Redis:', err);
                    });

                    console.log(`Socket disconnected: ${socket.id}`);
                } catch (error) {
                    console.error('Error handling disconnect:', error);
                }
            });
        });
    }

    /**
     * Get information about active consultation rooms
     * @returns {Object} Room statistics
     */
    getStats() {
        const stats = {
            activeRooms: this.rooms.size,
            totalConnections: this.io.sockets.sockets.size,
            rooms: []
        };

        this.rooms.forEach((sockets, roomId) => {
            stats.rooms.push({
                roomId,
                participants: sockets.size
            });
        });

        return stats;
    }

    /**
     * Close a specific consultation room
     * @param {String} appointmentId - Room/appointment ID to close
     */
    closeRoom(appointmentId) {
        if (this.rooms.has(appointmentId)) {
            // Notify all users in room
            this.io.to(appointmentId).emit('room-closed', {
                message: 'This consultation has been closed by the system',
                timestamp: new Date().toISOString()
            });

            // Disconnect all sockets in room
            this.rooms.get(appointmentId).forEach(socketId => {
                const socket = this.io.sockets.sockets.get(socketId);
                if (socket) {
                    socket.leave(appointmentId);
                }
            });

            // Remove room
            this.rooms.delete(appointmentId);
        }
    }
}

module.exports = WebRTCService;