const express = require('express');
const router = express.Router();
const ConsultationController = require('./controller');
const { authenticateUser, ensureAppointmentAccess } = require('../auth');

// Initialize controller
const consultationController = new ConsultationController();

/**
 * @route GET /api/consultations/:appointmentId/join
 * @desc Join a consultation session
 * @access Private (Patient or Doctor involved in appointment)
 */
router.get(
    '/:appointmentId/join',
    authenticateUser,
    (req, res, next) => {
        // Log the appointment ID to help debug
        console.log(`Consultation join attempt for appointment: ${req.params.appointmentId}`);
        next();
    },
    consultationController.joinConsultation
);

/**
 * @route POST /api/consultations/:appointmentId/end
 * @desc End a consultation
 * @access Private (Doctors only)
 */
router.post(
    '/:appointmentId/end',
    authenticateUser,
    consultationController.endConsultation
);

/**
 * @route GET /api/consultations/:appointmentId/status
 * @desc Get consultation status
 * @access Private (Patient or Doctor involved in appointment)
 */
router.get(
    '/:appointmentId/status',
    authenticateUser,
    consultationController.getConsultationStatus
);

module.exports = router;