const { MedicalAssistant } = require('./index');

/**
 * Chat with the medical assistant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.chatWithAssistant = async (req, res) => {
    try {
        const { message } = req.body;
        // Use authenticated user ID if available, otherwise require it in request body
        const userId = req.user ? req.user.id : req.body.userId;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Only fallback to request body userId if user is not authenticated
        if (!userId) {
            return res.status(400).json({ message: 'User authentication required' });
        }

        // Generate response from AI assistant
        const reply = await MedicalAssistant.generateResponse(message, userId);

        res.status(200).json({ reply });
    } catch (error) {
        console.error('Error in assistant chat:', error);
        res.status(500).json({
            message: 'An error occurred while processing your request',
            error: error.message
        });
    }
};

/**
 * Clear conversation history with the assistant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.clearConversationHistory = async (req, res) => {
    try {
        // Use authenticated user ID only
        const userId = req.user.id;

        // Clear conversation history
        await MedicalAssistant.clearConversationHistory(userId);

        res.status(200).json({ message: 'Conversation history cleared successfully' });
    } catch (error) {
        console.error('Error clearing conversation history:', error);
        res.status(500).json({
            message: 'An error occurred while clearing conversation history',
            error: error.message
        });
    }
};

/**
 * Get health information about a specific topic
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getHealthInfo = async (req, res) => {
    try {
        const { topic } = req.params;
        // Use authenticated user ID if available, otherwise use anonymous
        const userId = req.user ? req.user.id : 'anonymous';

        if (!topic) {
            return res.status(400).json({ message: 'Topic is required' });
        }

        // Construct a message asking for information about the topic
        const message = `Can you provide general information about ${topic}?`;

        // Generate response from AI assistant
        const reply = await MedicalAssistant.generateResponse(message, userId);

        res.status(200).json({ topic, information: reply });
    } catch (error) {
        console.error('Error getting health information:', error);
        res.status(500).json({
            message: 'An error occurred while fetching health information',
            error: error.message
        });
    }
};

/**
 * Check symptoms (basic guidance only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.checkSymptoms = async (req, res) => {
    try {
        const { symptoms } = req.body;
        // Use authenticated user ID if available, otherwise require it
        const userId = req.user ? req.user.id : req.body.userId;

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({ message: 'Valid symptoms array is required' });
        }

        if (!userId) {
            return res.status(400).json({ message: 'User authentication required' });
        }

        // Construct a message asking about the symptoms
        const message = `I'm experiencing the following symptoms: ${symptoms.join(', ')}. What could this mean and what should I do?`;

        // Generate response from AI assistant
        const reply = await MedicalAssistant.generateResponse(message, userId);

        res.status(200).json({
            symptoms,
            guidance: reply,
            disclaimer: 'This information is for educational purposes only and is not a substitute for professional medical advice. Please consult with a qualified healthcare provider for diagnosis and treatment.'
        });
    } catch (error) {
        console.error('Error checking symptoms:', error);
        res.status(500).json({
            message: 'An error occurred while checking symptoms',
            error: error.message
        });
    }
};