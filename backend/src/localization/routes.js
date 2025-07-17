// backend/src/localization/routes.js
const express = require('express');
const router = express.Router();
const localizationController = require('./controller');
const { authenticateUser, authorizeRoles } = require('../auth');

// Public routes
router.get('/languages', authenticateUser, localizationController.getLanguages);
router.get('/:locale', authenticateUser, localizationController.getTranslations);
router.get('/:locale/version', authenticateUser, localizationController.getVersion);

// Admin routes
router.put('/:locale', authenticateUser, authorizeRoles('admin'), localizationController.updateTranslations);

module.exports = router;