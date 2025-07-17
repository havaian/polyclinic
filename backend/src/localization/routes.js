// backend/src/localization/routes.js
const express = require('express');
const router = express.Router();
const localizationController = require('./controller');
const { authenticate, authorizeRoles } = require('../auth');

// Public routes
router.get('/languages', localizationController.getLanguages);
router.get('/:locale', localizationController.getTranslations);
router.get('/:locale/version', localizationController.getVersion);

// Admin routes
router.put('/:locale', authenticate, authorizeRoles('admin'), localizationController.updateTranslations);

module.exports = router;