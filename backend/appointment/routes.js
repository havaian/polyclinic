const express = require('express');
const router = express.Router();
const appointmentController = require('./controller');
const { authenticateUser, authorizeRoles } = require('../auth');

/**
 * @route POST /api/appointments
 * @desc Create a new appointment
 * @access Private (Patients only)
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
 * @access Private (Patient or Admin)
 */
router.get(
    '/patient/:patientId',
    authenticateUser,
    authorizeRoles(['patient', 'admin']),
    appointmentController.getPatientAppointments
);

/**
 * @route GET /api/appointments/doctor/:doctorId
 * @desc Get all appointments for a doctor
 * @access Private (Doctor or Admin)
 */
router.get(
    '/doctor/:doctorId',
    authenticateUser,
    authorizeRoles(['doctor', 'admin']),
    appointmentController.getDoctorAppointments
);

/**
 * @route GET /api/appointments/:id
 * @desc Get a specific appointment by ID
 * @access Private (Involved parties only)
 */
router.get(
    '/:id',
    authenticateUser,
    appointmentController.getAppointmentById
);

/**
 * @route PATCH /api/appointments/:id/status
 * @desc Update appointment status
 * @access Private (Doctor, Patient or Admin)
 */
router.patch(
    '/:id/status',
    authenticateUser,
    appointmentController.updateAppointmentStatus
);

/**
 * @route PATCH /api/appointments/:id/prescriptions
 * @desc Add/update prescriptions for an appointment
 * @access Private (Doctors only)
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
 * @access Private (Doctors only)
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
 * @access Public
 */
router.get(
    '/availability/:doctorId',
    appointmentController.getDoctorAvailability
);

module.exports = router;