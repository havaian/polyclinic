/**
 * Utility functions for handling text encoding and sanitization
 */

/**
 * Safely encode text to prevent unicode conversion issues
 * @param {String} text - Text to encode
 * @returns {String} Safely encoded text
 */
exports.safeEncodeText = function(text) {
    if (!text || typeof text !== 'string') return text;
    
    try {
        // Handle any potential Unicode normalization issues
        return text.normalize('NFC');
    } catch (error) {
        console.error('Error encoding text:', error);
        return text; // Return original if encoding fails
    }
};

/**
 * Sanitize input text to prevent XSS and other injection attacks
 * @param {String} text - Text to sanitize
 * @returns {String} Sanitized text
 */
exports.sanitizeInput = function(text) {
    if (!text || typeof text !== 'string') return text;
    
    // Basic HTML character escaping
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Decode safely encoded text for display
 * @param {String} text - Text to decode
 * @returns {String} Decoded text
 */
exports.safeDecodeText = function(text) {
    if (!text || typeof text !== 'string') return text;
    
    try {
        // For now, just return the text as it's already in a readable format
        // This function can be extended later if needed
        return text;
    } catch (error) {
        console.error('Error decoding text:', error);
        return text; // Return original if decoding fails
    }
};