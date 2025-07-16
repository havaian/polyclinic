const express = require('express');
const router = express.Router();
const specializationController = require('./controller');

/**
 * @route GET /api/expertise
 * @desc Get all active expertise
 * @access Public
 */
router.get('/', specializationController.getActiveExpertise);

/**
 * @route GET /api/expertise/:id
 * @desc Get expertise by ID
 * @access Public
 */
router.get('/:id', specializationController.getSpecializationById);

/**
 * @route GET /api/expertise/:id/providers
 * @desc Get providers by expertise
 * @access Public
 */
router.get('/:id/providers', specializationController.getProvidersBySpecialization);

module.exports = router;