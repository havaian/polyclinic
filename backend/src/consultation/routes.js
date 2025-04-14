const express = require('express');
const router = express.Router();
const ConsultationController = require('./controller');
const { authenticateUser, ensureAppointmentAccess } = require('../auth');

// Initialize controller with WebRTC service (to be injected when routes are registered)
let consultationController;

/**
 * Initialize consultation routes with WebRTC service
 * @param {Object} webRTCService - WebRTC service instance
 * @returns {Object} Express router
 */
const initializeRoutes = (webRTCService) => {
    // Initialize controller with WebRTC service
    consultationController = new ConsultationController(webRTCService);

    /**
     * @route GET /api/consultations/:appointmentId/join
     * @desc Join a consultation session
     * @access Private (Patient or Doctor involved in appointment)
     */
    router.get(
        '/:appointmentId/join',
        authenticateUser,
        ensureAppointmentAccess,
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
        ensureAppointmentAccess,
        consultationController.getConsultationStatus
    );

    return router;
};

module.exports = {
    consultationRoutes: router,
    initializeConsultationRoutes: initializeRoutes
};