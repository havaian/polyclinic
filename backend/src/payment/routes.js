const express = require('express');
const router = express.Router();
const paymentController = require('./controller');
const { authenticateUser, authorizeRoles } = require('../auth');

// Note: Webhook route is handled directly in index.js with raw body parser

/**
 * @route POST /api/payments/create-checkout
 * @desc Create a Stripe Checkout session for payment
 * @access Private (patient or admin)
 */
router.post(
    '/create-checkout',
    authenticateUser,
    authorizeRoles(['patient', 'admin']),
    paymentController.createCheckoutSession
);

/**
 * @route GET /api/payments/:id
 * @desc Get payment details
 * @access Private (involved parties only)
 */
router.get(
    '/:id',
    authenticateUser,
    paymentController.getPaymentDetails
);

/**
 * @route GET /api/payments/session/:sessionId
 * @desc Verify payment session status
 * @access Public (needed for redirect after payment)
 */
router.get(
    '/session/:sessionId',
    paymentController.verifySessionStatus
);

/**
 * @route POST /api/payments/:paymentId/generate-invoice
 * @desc Generate an invoice for a payment
 * @access Private (involved parties or admin)
 */
router.post(
    '/:paymentId/generate-invoice',
    authenticateUser,
    paymentController.generateInvoice
);

/**
 * @route GET /api/payments/patient/:patientId
 * @desc Get all payments for a patient
 * @access Private (patient or admin)
 */
router.get(
    '/patient/:patientId',
    authenticateUser,
    paymentController.getPatientPayments
);

/**
 * @route GET /api/payments/doctor/:doctorId
 * @desc Get all payments for a doctor
 * @access Private (doctor or admin)
 */
router.get(
    '/doctor/:doctorId',
    authenticateUser,
    paymentController.getDoctorPayments
);

module.exports = router;