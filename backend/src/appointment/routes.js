const express = require('express');
const router = express.Router();
const appointmentController = require('./controller');
const { authenticateUser, authorizeRoles, ensureOwnership } = require('../auth');
// Import multer configuration for file uploads
const upload = require('../utils/multerConfig');

/**
 * @route POST /api/appointments
 * @desc Create a new appointment
 * @access Private (Clients only - uses authenticated user ID)
 */
router.post(
    '/',
    authenticateUser,
    authorizeRoles(['client', 'admin']),
    appointmentController.createAppointment
);

/**
 * @route GET /api/appointments/client/:clientId
 * @desc Get all appointments for a client
 * @access Private (Client must be the owner or Admin)
 */
router.get(
    '/client/:clientId',
    authenticateUser,
    authorizeRoles(['client', 'admin']),
    ensureOwnership('clientId'),
    appointmentController.getClientAppointments
);

/**
 * @route GET /api/appointments/client/:clientId/pending-followups
 * @desc Get pending follow-up appointments for a client
 * @access Private (Client must be the owner or Admin)
 */
router.get(
    '/client/:clientId/pending-followups',
    authenticateUser,
    authorizeRoles(['client', 'admin']),
    ensureOwnership('clientId'),
    appointmentController.getPendingFollowUps
);

/**
 * @route GET /api/appointments/provider/:providerId
 * @desc Get all appointments for a provider
 * @access Private (Provider must be the owner or Admin)
 */
router.get(
    '/provider/:providerId',
    authenticateUser,
    authorizeRoles(['provider', 'admin']),
    ensureOwnership('providerId'),
    appointmentController.getProviderAppointments
);

/**
 * @route GET /api/appointments/calendar
 * @desc Get appointments in calendar format
 * @access Private
 */
router.get(
    '/calendar',
    authenticateUser,
    appointmentController.getCalendarAppointments
);

/**
 * @route GET /api/appointments/:id
 * @desc Get a specific appointment by ID
 * @access Private (Only involved parties or Admin)
 */
router.get(
    '/:id',
    authenticateUser,
    appointmentController.getAppointmentById
);

/**
 * @route PATCH /api/appointments/:id/status
 * @desc Update appointment status
 * @access Private (Provider, Client or Admin - only for their own appointments)
 */
router.patch(
    '/:id/status',
    authenticateUser,
    appointmentController.updateAppointmentStatus
);

/**
 * @route POST /api/appointments/:id/confirm
 * @desc Provider confirms appointment
 * @access Private (Providers only - only for their appointments)
 */
router.post(
    '/:id/confirm',
    authenticateUser,
    authorizeRoles(['provider']),
    appointmentController.confirmAppointment
);

/**
 * @route PATCH /api/appointments/:id/recommendations
 * @desc Add/update recommendations for an appointment
 * @access Private (Providers only - only for their appointments)
 */
router.patch(
    '/:id/recommendations',
    authenticateUser,
    authorizeRoles(['provider']),
    appointmentController.updateRecommendations
);

/**
 * @route POST /api/appointments/:id/documents
 * @desc Upload medical documents for an appointment
 * @access Private (Clients and Providers - only for their appointments)
 */
router.post(
    '/:id/documents',
    authenticateUser,
    appointmentController.uploadDocument
);

/**
 * @route GET /api/appointments/:id/documents
 * @desc Get documents for an appointment
 * @access Private (Only involved parties or Admin)
 */
router.get(
    '/:id/documents',
    authenticateUser,
    appointmentController.getDocuments
);

/**
 * @route POST /api/appointments/:id/follow-up
 * @desc Schedule a follow-up appointment
 * @access Private (Providers only - only for their appointments)
 */
router.post(
    '/:id/follow-up',
    authenticateUser,
    authorizeRoles(['provider']),
    appointmentController.scheduleFollowUp
);

/**
 * @route GET /api/appointments/availability/:providerId
 * @desc Get provider's availability slots
 * @access Public (no authentication needed for viewing availability)
 */
router.get(
    '/availability/:providerId',
    appointmentController.getProviderAvailability
);

/**
 * @route GET /api/appointments/pending-confirmation/provider/:providerId
 * @desc Get appointments pending provider confirmation
 * @access Private (Provider must be the owner or Admin)
 */
router.get(
    '/pending-confirmation/provider/:providerId',
    authenticateUser,
    authorizeRoles(['provider', 'admin']),
    ensureOwnership('providerId'),
    appointmentController.getPendingConfirmations
);

/**
 * @route PATCH /api/appointments/:id/session-results
 * @desc Update session results (summary, recommendations, follow-up)
 * @access Private (Providers only - only for their appointments)
 */
router.patch(
    '/:id/session-results',
    authenticateUser,
    authorizeRoles(['provider']),
    appointmentController.updateSessionResults
);

/**
 * @route POST /api/appointments/:id/documents
 * @desc Upload medical documents for an appointment
 * @access Private (Clients and Providers - only for their appointments)
 */
router.post(
    '/:id/documents',
    authenticateUser,
    upload.single('document'), // Use multer middleware for file upload
    appointmentController.uploadDocument
);

/**
 * @route GET /api/appointments/:id/documents
 * @desc Get documents for an appointment
 * @access Private (Only involved parties or Admin)
 */
router.get(
    '/:id/documents',
    authenticateUser,
    appointmentController.getDocuments
);

/**
 * @route GET /api/appointments/calendar
 * @desc Get appointments in calendar format
 * @access Private
 */
router.get(
    '/calendar',
    authenticateUser,
    appointmentController.getCalendarAppointments
);

module.exports = router;