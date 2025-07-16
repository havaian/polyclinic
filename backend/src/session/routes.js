const express = require('express');
const router = express.Router();
const SessionController = require('./controller');
const { authenticateUser, ensureAppointmentAccess } = require('../auth');

// Initialize controller
const sessionController = new SessionController();

/**
 * @route GET /api/sessions/:appointmentId/join
 * @desc Join a session session
 * @access Private (Client or Provider involved in appointment)
 */
router.get(
    '/:appointmentId/join',
    authenticateUser,
    (req, res, next) => {
        // Log the appointment ID to help debug
        console.log(`Session join attempt for appointment: ${req.params.appointmentId}`);
        next();
    },
    sessionController.joinSession
);

/**
 * @route POST /api/sessions/:appointmentId/end
 * @desc End a session
 * @access Private (Providers only)
 */
router.post(
    '/:appointmentId/end',
    authenticateUser,
    sessionController.endSession
);

/**
 * @route POST /api/sessions/:appointmentId/recommendations
 * @desc Add recommendations to a completed appointment
 * @access Private (Providers only)
 */
router.post(
    '/:appointmentId/recommendations',
    authenticateUser,
    sessionController.addRecommendations
);

/**
 * @route POST /api/sessions/:appointmentId/follow-up
 * @desc Create a follow-up appointment
 * @access Private (Providers only)
 */
router.post(
    '/:appointmentId/follow-up',
    authenticateUser,
    sessionController.createFollowUp
);

/**
 * @route GET /api/sessions/:appointmentId/status
 * @desc Get session status
 * @access Private (Client or Provider involved in appointment)
 */
router.get(
    '/:appointmentId/status',
    authenticateUser,
    sessionController.getSessionStatus
);

/**
 * @route POST /api/sessions/:appointmentId/chat-log
 * @desc Save chat log from session
 * @access Private (Client or Provider involved in appointment)
 */
router.post(
    '/:appointmentId/chat-log',
    authenticateUser,
    sessionController.saveChatLog
);

/**
 * @route POST /api/sessions/:appointmentId/exit
 * @desc Handle exit from session room
 * @access Private (Client or Provider involved in appointment)
 */
router.post(
    '/:appointmentId/exit',
    authenticateUser,
    sessionController.handleRoomExit
);

module.exports = router;