const express = require('express');
const router = express.Router();
const userController = require('./controller');
const { authenticateUser, authorizeRoles, preventProviderRegistration, ensureTermsAccepted } = require('../auth');

/**
 * @route POST /api/users/register
 * @desc Register a new user (client or provider)
 * @access Public
 */
router.post('/register', preventProviderRegistration, ensureTermsAccepted, userController.registerUser);

/**
 * @route GET /api/users/verify/:token
 * @desc Verify user email
 * @access Public
 */
router.get('/verify/:token', userController.verifyEmail);

/**
 * @route POST /api/users/login
 * @desc Login user
 * @access Public
 */
router.post('/login', userController.loginUser);

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticateUser, userController.getCurrentUser);

/**
 * @route PATCH /api/users/me
 * @desc Update user profile
 * @access Private
 */
router.patch('/me', authenticateUser, userController.updateUserProfile);

/**
 * @route POST /api/users/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', authenticateUser, userController.changePassword);

/**
 * @route POST /api/users/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', userController.forgotPassword);

/**
 * @route POST /api/users/reset-password/:token
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password/:token', userController.resetPassword);

/**
 * @route GET /api/users/providers
 * @desc Get all providers with optional filters
 * @access Public
 */
router.get('/providers', userController.getProviders);

/**
 * @route GET /api/users/providers/:id
 * @desc Get provider by ID
 * @access Public
 */
router.get('/providers/:id', userController.getProviderById);

/**
 * @route POST /api/users/deactivate
 * @desc Deactivate user account
 * @access Private
 */
router.post('/deactivate', authenticateUser, userController.deactivateAccount);

module.exports = router;