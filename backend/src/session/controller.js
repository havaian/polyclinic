const Appointment = require('../appointment/model');
const User = require('../user/model');
const JitsiUtils = require('../utils/jitsiUtils');
const { NotificationService } = require('../notification');

/**
 * Controller for handling session-related operations
 */
class SessionController {
    /**
     * Initialize session controller
     */
    constructor() {
        // No need for webRTCService with Jitsi integration
    }

    /**
     * Join a session session
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    joinSession = async (req, res) => {
        try {
            const { appointmentId } = req.params;
            const userId = req.user.id;

            if (!appointmentId) {
                return res.status(400).json({ message: 'Appointment ID is required' });
            }

            // Find appointment
            const appointment = await Appointment.findById(appointmentId)
                .populate('provider', 'firstName lastName profilePicture expertise email')
                .populate('client', 'firstName lastName profilePicture dateOfBirth email');

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            // Check if user is involved in the appointment
            const isProvider = req.user.role === 'provider' && appointment.provider._id.toString() === userId.toString();
            const isClient = req.user.role === 'client' && appointment.client._id.toString() === userId.toString();

            if (!isProvider && !isClient) {
                return res.status(403).json({ message: 'You are not authorized to join this session' });
            }

            // Check if appointment is scheduled or in progress
            if (appointment.status !== 'scheduled') {
                return res.status(400).json({
                    message: `Cannot join session with status "${appointment.status}"`,
                    status: appointment.status
                });
            }

            // Check if appointment time is valid (not too early, not too late)
            const now = new Date();
            const appointmentTime = new Date(appointment.dateTime);
            const timeDiffMinutes = (appointmentTime - now) / (1000 * 60);

            // Can join 5 minutes before scheduled time
            if (timeDiffMinutes > 5) {
                return res.status(400).json({
                    message: 'Session is not ready yet',
                    startsInMinutes: Math.floor(timeDiffMinutes)
                });
            }

            // Cannot join 30 minutes after scheduled time
            if (timeDiffMinutes < -30) {
                return res.status(400).json({ message: 'Session time has expired' });
            }

            // Check if session has already ended (endTime has passed)
            if (appointment.endTime && now > appointment.endTime) {
                return res.status(400).json({ message: 'Session has already ended' });
            }

            // User info for Jitsi token
            const userInfo = {
                id: userId,
                name: isProvider ?
                    `Dr. ${appointment.provider.firstName} ${appointment.provider.lastName}` :
                    `${appointment.client.firstName} ${appointment.client.lastName}`,
                avatar: isProvider ? appointment.provider.profilePicture : appointment.client.profilePicture,
                email: isProvider ? appointment.provider.email : appointment.client.email,
                role: isProvider ? 'provider' : 'client'
            };

            // Generate Jitsi configuration
            const jitsiConfig = JitsiUtils.getJitsiConfig(appointmentId, userInfo);

            // Add custom configuration for participant limits - maximum of 2 participants
            jitsiConfig.interfaceConfigOverwrite = {
                ...jitsiConfig.interfaceConfigOverwrite,
                MAXIMUM_ZOOMING_COEFFICIENT: 1.0,
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                SHOW_JITSI_WATERMARK: false,
                ENFORCE_NOTIFICATION_AUTO_DISMISS_TIMEOUT: 15000,
                // Set maximum number of participants
                MAX_PARTICIPANTS: 2,
                // Don't allow external API manipulation to override this
                ALLOW_MULTIPLE_AUDIO_INPUT: false,
                HIDE_INVITE_MORE_HEADER: true,
                DISABLE_FOCUS_INDICATOR: false,
                DISABLE_VIDEO_BACKGROUND: false,
                // Disable the Lobby feature (waiting room)
                ENABLE_LOBBY: false,
                // Disable the Breakout Rooms feature
                ENABLE_BREAKOUT_ROOMS: false
            };

            // Add participant limits to the token's context
            jitsiConfig.jwt = JitsiUtils.generateJitsiToken(jitsiConfig.roomName, userInfo, {
                maxParticipants: 2,
                allowedParticipants: [
                    appointment.provider._id.toString(),
                    appointment.client._id.toString()
                ]
            });

            // Prepare response with session info
            res.status(200).json({
                message: 'Joined session successfully',
                session: {
                    appointmentId: appointment._id,
                    type: appointment.type,
                    provider: {
                        id: appointment.provider._id,
                        name: `Dr. ${appointment.provider.firstName} ${appointment.provider.lastName}`,
                        profilePicture: appointment.provider.profilePicture,
                        expertise: appointment.provider.expertise
                    },
                    client: {
                        id: appointment.client._id,
                        name: `${appointment.client.firstName} ${appointment.client.lastName}`,
                        profilePicture: appointment.client.profilePicture,
                        dateOfBirth: appointment.client.dateOfBirth
                    },
                    dateTime: appointment.dateTime,
                    endTime: appointment.endTime,
                    purpose: appointment.purpose,
                    userRole: isProvider ? 'provider' : 'client',
                    jitsi: jitsiConfig
                }
            });
        } catch (error) {
            console.error('Error joining session:', error);
            res.status(500).json({ message: 'An error occurred while joining the session' });
        }
    };

    /**
     * End a session (provider only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    endSession = async (req, res) => {
        try {
            const { appointmentId } = req.params;
            const { sessionSummary, chatLog } = req.body;

            if (!appointmentId) {
                return res.status(400).json({ message: 'Appointment ID is required' });
            }

            // Find appointment
            const appointment = await Appointment.findById(appointmentId);

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            // Only provider or admin can end session
            if (req.user.role !== 'provider' && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Only providers can end sessions' });
            }

            // Provider must be assigned to the appointment
            if (req.user.role === 'provider' && appointment.provider.toString() !== req.user.id) {
                return res.status(403).json({ message: 'You are not the provider for this appointment' });
            }

            // Update appointment status
            appointment.status = 'completed';

            // Add session summary if provided
            if (sessionSummary) {
                appointment.sessionSummary = sessionSummary;
            }

            // Save chat log if provided
            if (chatLog && Array.isArray(chatLog) && chatLog.length > 0) {
                appointment.chatLog = chatLog;
            }

            await appointment.save();

            // Send completion notification
            await NotificationService.sendAppointmentCompletionNotification(appointment);

            res.status(200).json({
                message: 'Session ended successfully',
                appointment
            });
        } catch (error) {
            console.error('Error ending session:', error);
            res.status(500).json({ message: 'An error occurred while ending the session' });
        }
    };

    /**
     * Add recommendations to a completed appointment
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    addRecommendations = async (req, res) => {
        try {
            const { appointmentId } = req.params;
            const { recommendations } = req.body;

            if (!appointmentId) {
                return res.status(400).json({ message: 'Appointment ID is required' });
            }

            if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
                return res.status(400).json({ message: 'Valid recommendations array is required' });
            }

            // Find appointment
            const appointment = await Appointment.findById(appointmentId);

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            // Only provider or admin can add recommendations
            if (req.user.role !== 'provider' && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Only providers can add recommendations' });
            }

            // Provider must be assigned to the appointment
            if (req.user.role === 'provider' && appointment.provider.toString() !== req.user.id) {
                return res.status(403).json({ message: 'You are not the provider for this appointment' });
            }

            // Validate prescription data
            const validRecommendations = recommendations.filter(prescription => {
                return prescription.medication && prescription.dosage && prescription.frequency && prescription.duration;
            });

            if (validRecommendations.length === 0) {
                return res.status(400).json({ message: 'No valid recommendations provided' });
            }

            // Add recommendations to appointment
            appointment.recommendations = validRecommendations;
            await appointment.save();

            // Send prescription notification
            await NotificationService.sendPrescriptionNotification(appointment);

            res.status(200).json({
                message: 'Recommendations added successfully',
                recommendations: appointment.recommendations
            });
        } catch (error) {
            console.error('Error adding recommendations:', error);
            res.status(500).json({ message: 'An error occurred while adding recommendations' });
        }
    };

    /**
     * Create a follow-up appointment
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    createFollowUp = async (req, res) => {
        try {
            const { appointmentId } = req.params;
            const { followUpDate, notes } = req.body;

            if (!appointmentId) {
                return res.status(400).json({ message: 'Appointment ID is required' });
            }

            if (!followUpDate) {
                return res.status(400).json({ message: 'Follow-up date is required' });
            }

            // Validate follow-up date (must be in the future)
            const followUpDateObj = new Date(followUpDate);
            const now = new Date();
            if (followUpDateObj <= now) {
                return res.status(400).json({ message: 'Follow-up date must be in the future' });
            }

            // Find the original appointment
            const originalAppointment = await Appointment.findById(appointmentId)
                .populate('provider', 'firstName lastName sessionFee')
                .populate('client', 'firstName lastName');

            if (!originalAppointment) {
                return res.status(404).json({ message: 'Original appointment not found' });
            }

            // Only provider or admin can create follow-up
            if (req.user.role !== 'provider' && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Only providers can create follow-up appointments' });
            }

            // Provider must be assigned to the appointment
            if (req.user.role === 'provider' && originalAppointment.provider._id.toString() !== req.user.id.toString()) {
                return res.status(403).json({ message: 'You are not the provider for this appointment' });
            }

            // Update original appointment with follow-up recommendation
            originalAppointment.followUp = {
                recommended: true,
                date: followUpDateObj,
                notes: notes || ''
            };
            await originalAppointment.save();

            // Create new follow-up appointment with 'pending-payment' status
            const followUpAppointment = new Appointment({
                client: originalAppointment.client._id,
                provider: originalAppointment.provider._id,
                dateTime: followUpDateObj,
                type: originalAppointment.type,
                purpose: `Follow-up to appointment on ${new Date(originalAppointment.dateTime).toLocaleDateString()} - ${notes || 'No notes provided'}`,
                status: 'pending-payment', // Special status for follow-ups pending payment
                payment: {
                    amount: originalAppointment.provider.sessionFee,
                    status: 'pending'
                }
            });

            await followUpAppointment.save();

            // Notify client about follow-up
            await NotificationService.sendFollowUpNotification(followUpAppointment);

            res.status(201).json({
                message: 'Follow-up appointment created successfully',
                followUpAppointment
            });
        } catch (error) {
            console.error('Error creating follow-up appointment:', error);
            res.status(500).json({ message: 'An error occurred while creating follow-up appointment' });
        }
    };

    /**
     * Get session status
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getSessionStatus = async (req, res) => {
        try {
            const { appointmentId } = req.params;

            if (!appointmentId) {
                return res.status(400).json({ message: 'Appointment ID is required' });
            }

            // Find appointment
            const appointment = await Appointment.findById(appointmentId);

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            res.status(200).json({
                appointmentId,
                status: appointment.status,
                isActive: appointment.status === 'scheduled',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error getting session status:', error);
            res.status(500).json({ message: 'An error occurred while checking session status' });
        }
    };

    /**
     * Save chat log from session
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    saveChatLog = async (req, res) => {
        try {
            const { appointmentId } = req.params;
            const { chatLog } = req.body;

            if (!appointmentId) {
                return res.status(400).json({ message: 'Appointment ID is required' });
            }

            if (!chatLog || !Array.isArray(chatLog)) {
                return res.status(400).json({ message: 'Valid chat log array is required' });
            }

            // Find appointment
            const appointment = await Appointment.findById(appointmentId);

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            // Check if user is involved in the appointment
            const isProvider = req.user.role === 'provider' && appointment.provider.toString() === req.user.id;
            const isClient = req.user.role === 'client' && appointment.client.toString() === req.user.id;

            if (!isProvider && !isClient && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'You are not authorized to save chat logs for this appointment' });
            }

            // Save chat log
            appointment.chatLog = chatLog;
            await appointment.save();

            res.status(200).json({
                message: 'Chat log saved successfully'
            });
        } catch (error) {
            console.error('Error saving chat log:', error);
            res.status(500).json({ message: 'An error occurred while saving chat log' });
        }
    };

    /**
     * Handle session room exit
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
    */
    handleRoomExit = async (req, res) => {
        try {
            const { appointmentId, userId } = req.body;

            if (!appointmentId || !userId) {
                return res.status(400).json({ message: 'Appointment ID and User ID are required' });
            }

            // Find appointment
            const appointment = await Appointment.findById(appointmentId);

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            // Only process for scheduled appointments
            if (appointment.status !== 'scheduled') {
                return res.status(200).json({
                    message: 'Appointment is not in scheduled status',
                    status: appointment.status
                });
            }

            // Track participant exit in the appointment metadata
            if (!appointment.participantStatus) {
                appointment.participantStatus = {};
            }

            // Record exit time
            appointment.participantStatus[userId] = {
                exitTime: new Date(),
                status: 'left'
            };

            // Check if both participants have left
            const providerId = appointment.provider.toString();
            const clientId = appointment.client.toString();

            const bothParticipantsLeft =
                appointment.participantStatus[providerId]?.status === 'left' &&
                appointment.participantStatus[clientId]?.status === 'left';

            // If both have left and at least 10 minutes have passed since appointment start time
            const appointmentStartTime = new Date(appointment.dateTime);
            const now = new Date();
            const minutesSinceStart = (now - appointmentStartTime) / (1000 * 60);

            if (bothParticipantsLeft && minutesSinceStart >= 10) {
                // Auto-complete the appointment
                appointment.status = 'completed';

                // Add default session summary if none exists
                if (!appointment.sessionSummary) {
                    appointment.sessionSummary = 'This session was automatically marked as completed when both participants left the session.';
                }

                // Send notification
                await NotificationService.sendSessionCompletedNotification(appointment);

                console.log(`Auto-completed session ${appointment._id} after both participants left the room`);
            }

            await appointment.save();

            res.status(200).json({
                message: 'Room exit recorded successfully',
                bothLeft: bothParticipantsLeft,
                appointmentStatus: appointment.status
            });
        } catch (error) {
            console.error('Error handling room exit:', error);
            res.status(500).json({ message: 'An error occurred while processing room exit' });
        }
    }

    /**
     * Update session summary and add new recommendations
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
    */
    updateSessionResults = async (req, res) => {
        try {
            const { id } = req.params;
            const { sessionSummary, recommendations, followUp } = req.body;
            const providerId = req.user.id;

            // Find the appointment
            const appointment = await Appointment.findById(id)
                .populate('client', 'firstName lastName email telegramId')
                .populate('provider', 'firstName lastName email telegramId');

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            // Verify provider is assigned to this appointment
            if (appointment.provider._id.toString() !== providerId.toString()) {
                return res.status(403).json({ message: 'You are not authorized to update this session' });
            }

            // Verify appointment is completed
            if (appointment.status !== 'completed') {
                return res.status(400).json({ message: 'Can only update completed sessions' });
            }

            // Update session summary if provided
            if (sessionSummary) {
                appointment.sessionSummary = sessionSummary;
            }

            // Add new recommendations if provided (don't replace existing ones)
            if (recommendations && Array.isArray(recommendations) && recommendations.length > 0) {
                // Filter out invalid recommendations
                const validRecommendations = recommendations.filter(prescription => {
                    return prescription.medication && prescription.dosage &&
                        prescription.frequency && prescription.duration;
                });

                // Add timestamp to each new prescription
                const timestampedRecommendations = validRecommendations.map(prescription => ({
                    ...prescription,
                    createdAt: Date.now()
                }));

                // If appointment already has recommendations, append new ones
                if (appointment.recommendations && Array.isArray(appointment.recommendations)) {
                    appointment.recommendations = [...appointment.recommendations, ...timestampedRecommendations];
                } else {
                    appointment.recommendations = timestampedRecommendations;
                }

                // Send prescription notification
                if (timestampedRecommendations.length > 0) {
                    await NotificationService.sendPrescriptionNotification(appointment);
                }
            }

            // Update follow-up recommendation if provided
            if (followUp && followUp.recommended) {
                appointment.followUp = {
                    recommended: true,
                    date: new Date(followUp.date),
                    notes: followUp.notes || ''
                };

                // If creating a follow-up appointment was requested
                if (followUp.createAppointment) {
                    // Calculate end time
                    const followUpDateObj = new Date(followUp.date);
                    const duration = followUp.duration || 30;
                    const endTime = new Date(followUpDateObj.getTime() + duration * 60000);

                    // Create a new appointment for the follow-up with pending-payment status
                    const followUpAppointment = new Appointment({
                        client: appointment.client._id,
                        provider: appointment.provider._id,
                        dateTime: followUpDateObj,
                        endTime: endTime,
                        duration: duration,
                        type: appointment.type,
                        purpose: `Follow-up to appointment on ${appointment.dateTime.toLocaleDateString()} - ${followUp.notes || 'No notes provided'}`,
                        status: 'pending-payment',
                        payment: {
                            amount: appointment.provider.sessionFee,
                            status: 'pending'
                        }
                    });

                    await followUpAppointment.save();

                    // Notify about follow-up
                    await NotificationService.sendFollowUpNotification(followUpAppointment);
                }
            }

            // Save changes
            await appointment.save();

            res.status(200).json({
                message: 'Session results updated successfully',
                appointment
            });

        } catch (error) {
            console.error('Error updating session results:', error);
            res.status(500).json({ message: 'An error occurred while updating session results' });
        }
    }
}

module.exports = SessionController;