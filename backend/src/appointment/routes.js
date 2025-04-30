const express = require('express');
const router = express.Router();
const appointmentController = require('./controller');
const { authenticateUser, authorizeRoles, ensureOwnership } = require('../auth');

/**
 * @route POST /api/appointments
 * @desc Create a new appointment
 * @access Private (Patients only - uses authenticated user ID)
 */
router.post(
    '/',
    authenticateUser,
    authorizeRoles(['patient', 'admin']),
    appointmentController.createAppointment
);

/**
 * @route GET /api/appointments/patient/:patientId
 * @desc Get all appointments for a patient
 * @access Private (Patient must be the owner or Admin)
 */
router.get(
    '/patient/:patientId',
    authenticateUser,
    authorizeRoles(['patient', 'admin']),
    ensureOwnership('patientId'),
    appointmentController.getPatientAppointments
);

/**
 * @route GET /api/appointments/patient/:patientId/pending-followups
 * @desc Get pending follow-up appointments for a patient
 * @access Private (Patient must be the owner or Admin)
 */
router.get(
    '/patient/:patientId/pending-followups',
    authenticateUser,
    authorizeRoles(['patient', 'admin']),
    ensureOwnership('patientId'),
    appointmentController.getPendingFollowUps
);

/**
 * @route GET /api/appointments/doctor/:doctorId
 * @desc Get all appointments for a doctor
 * @access Private (Doctor must be the owner or Admin)
 */
router.get(
    '/doctor/:doctorId',
    authenticateUser,
    authorizeRoles(['doctor', 'admin']),
    ensureOwnership('doctorId'),
    appointmentController.getDoctorAppointments
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
 * @access Private (Doctor, Patient or Admin - only for their own appointments)
 */
router.patch(
    '/:id/status',
    authenticateUser,
    appointmentController.updateAppointmentStatus
);

/**
 * @route PATCH /api/appointments/:id/prescriptions
 * @desc Add/update prescriptions for an appointment
 * @access Private (Doctors only - only for their appointments)
 */
router.patch(
    '/:id/prescriptions',
    authenticateUser,
    authorizeRoles(['doctor']),
    appointmentController.updatePrescriptions
);

/**
 * @route POST /api/appointments/:id/follow-up
 * @desc Schedule a follow-up appointment
 * @access Private (Doctors only - only for their appointments)
 */
router.post(
    '/:id/follow-up',
    authenticateUser,
    authorizeRoles(['doctor']),
    appointmentController.scheduleFollowUp
);

/**
 * @route GET /api/appointments/availability/:doctorId
 * @desc Get doctor's availability slots
 * @access Public (no authentication needed for viewing availability)
 */
router.get(
    '/availability/:doctorId',
    appointmentController.getDoctorAvailability
);

module.exports = router;
