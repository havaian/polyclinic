const Appointment = require('../appointment/model');
const User = require('../user/model');
const { authenticateUser } = require('../auth');

/**
 * Controller for handling consultation-related operations
 */
class ConsultationController {
    /**
     * Initialize consultation controller with WebRTC service
     * @param {Object} webRTCService - WebRTC service instance
     */
    constructor(webRTCService) {
        this.webRTCService = webRTCService;
    }

    /**
     * Join a consultation session
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    joinConsultation = async (req, res) => {
        try {
            const { appointmentId } = req.params;
            const userId = req.user.id;

            if (!appointmentId) {
                return res.status(400).json({ message: 'Appointment ID is required' });
            }

            // Find appointment
            const appointment = await Appointment.findById(appointmentId)
                .populate('doctor', 'firstName lastName profilePicture specializations')
                .populate('patient', 'firstName lastName profilePicture dateOfBirth');

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            // Check if user is involved in the appointment
            const isDoctor = req.user.role === 'doctor' && appointment.doctor._id.toString() === userId;
            const isPatient = req.user.role === 'patient' && appointment.patient._id.toString() === userId;

            if (!isDoctor && !isPatient) {
                return res.status(403).json({ message: 'You are not authorized to join this consultation' });
            }

            // Check if appointment is scheduled or in progress
            if (appointment.status !== 'scheduled') {
                return res.status(400).json({
                    message: `Cannot join consultation with status "${appointment.status}"`,
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
                    message: 'Consultation is not ready yet',
                    startsInMinutes: Math.floor(timeDiffMinutes)
                });
            }

            // Cannot join 30 minutes after scheduled time
            if (timeDiffMinutes < -30) {
                return res.status(400).json({ message: 'Consultation time has expired' });
            }

            // Generate TURN server credentials
            const turnCredentials = this.generateTurnCredentials();

            // Prepare response with consultation info
            res.status(200).json({
                message: 'Joined consultation successfully',
                consultation: {
                    appointmentId: appointment._id,
                    type: appointment.type,
                    doctor: {
                        id: appointment.doctor._id,
                        name: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
                        profilePicture: appointment.doctor.profilePicture,
                        specializations: appointment.doctor.specializations
                    },
                    patient: {
                        id: appointment.patient._id,
                        name: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
                        profilePicture: appointment.patient.profilePicture,
                        dateOfBirth: appointment.patient.dateOfBirth
                    },
                    dateTime: appointment.dateTime,
                    reasonForVisit: appointment.reasonForVisit,
                    userRole: isDoctor ? 'doctor' : 'patient',
                    turnCredentials
                }
            });
        } catch (error) {
            console.error('Error joining consultation:', error);
            res.status(500).json({ message: 'An error occurred while joining the consultation' });
        }
    };

    /**
     * End a consultation (doctor only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    endConsultation = async (req, res) => {
        try {
            const { appointmentId } = req.params;
            const { consultationSummary } = req.body;

            if (!appointmentId) {
                return res.status(400).json({ message: 'Appointment ID is required' });
            }

            // Find appointment
            const appointment = await Appointment.findById(appointmentId);

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            // Only doctor or admin can end consultation
            if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Only doctors can end consultations' });
            }

            // Doctor must be assigned to the appointment
            if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id) {
                return res.status(403).json({ message: 'You are not the doctor for this appointment' });
            }

            // Update appointment status
            appointment.status = 'completed';

            // Add consultation summary if provided
            if (consultationSummary) {
                appointment.consultationSummary = consultationSummary;
            }

            await appointment.save();

            // Close the WebRTC room
            this.webRTCService.closeRoom(appointmentId);

            res.status(200).json({
                message: 'Consultation ended successfully',
                appointment
            });
        } catch (error) {
            console.error('Error ending consultation:', error);
            res.status(500).json({ message: 'An error occurred while ending the consultation' });
        }
    };

    /**
     * Get consultation (webRTC) status
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getConsultationStatus = (req, res) => {
        try {
            const { appointmentId } = req.params;

            if (!appointmentId) {
                return res.status(400).json({ message: 'Appointment ID is required' });
            }

            // Get room status from WebRTC service
            const stats = this.webRTCService.getStats();
            const room = stats.rooms.find(r => r.roomId === appointmentId);

            // Determine if consultation is active
            const isActive = !!room;
            const participantCount = room ? room.participants : 0;

            res.status(200).json({
                appointmentId,
                isActive,
                participantCount,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error getting consultation status:', error);
            res.status(500).json({ message: 'An error occurred while checking consultation status' });
        }
    };

    /**
     * Generate TURN server credentials
     * @returns {Object} TURN credentials
     */
    generateTurnCredentials() {
        // This is a simple example - in production, use a proper TURN authentication mechanism
        const username = process.env.TURN_USERNAME || 'default';
        const credential = process.env.TURN_CREDENTIAL || 'default';
        const turnServerUrl = process.env.TURN_SERVER || 'turn:turn.e-polyclinic.uz:3478';

        return {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                {
                    urls: turnServerUrl,
                    username: username,
                    credential: credential
                }
            ]
        };
    }
}

module.exports = ConsultationController;