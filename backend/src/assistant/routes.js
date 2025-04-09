const express = require('express');
const router = express.Router();
const assistantController = require('./controller');
const { authenticateUser } = require('../auth/index');

/**
 * @route POST /api/assistant/chat
 * @desc Chat with the medical assistant
 * @access Public (but requires user ID)
 */
router.post('/chat', assistantController.chatWithAssistant);

/**
 * @route DELETE /api/assistant/conversation
 * @desc Clear conversation history with the assistant
 * @access Private
 */
router.delete('/conversation', authenticateUser, assistantController.clearConversationHistory);

/**
 * @route GET /api/assistant/health/:topic
 * @desc Get health information about a specific topic
 * @access Public
 */
router.get('/health/:topic', assistantController.getHealthInfo);

/**
 * @route POST /api/assistant/symptoms
 * @desc Check symptoms (basic guidance only)
 * @access Public (but requires user ID)
 */
router.post('/symptoms', assistantController.checkSymptoms);

module.exports = router;