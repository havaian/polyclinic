const jwt = require('jsonwebtoken');
const User = require('../user/model');
const Appointment = require('../appointment/model');

/**
 * Middleware to authenticate user based on JWT token
 */
exports.authenticateUser = async (req, res, next) => {
    try {
        let token;

        // Check if token exists in headers
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            // Extract token from Bearer
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            // Or get it from cookies
            token = req.cookies.token;
        }

        // Check token exists
        if (!token) {
            return res.status(401).json({
                message: 'You are not logged in. Please log in to get access.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by id
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                message: 'The user belonging to this token no longer exists.'
            });
        }

        // ADD THIS CHECK - Verify that user has confirmed their email
        if (!user.isVerified) {
            return res.status(401).json({
                message: 'Please verify your email before accessing this resource.'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                message: 'This account has been deactivated. Please contact support.'
            });
        }

        // Add user to request object
        req.user = {
            id: user._id,
            role: user.role
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Invalid token. Please log in again.'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Your token has expired. Please log in again.'
            });
        }

        console.error('Authentication error:', error);
        return res.status(500).json({
            message: 'An error occurred during authentication.'
        });
    }
};

/**
 * Middleware to authorize based on user roles
 * @param {Array} roles Array of allowed roles
 */
exports.authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: 'You must be logged in to access this resource.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role '${req.user.role}' is not authorized to access this resource.`
            });
        }

        next();
    };
};

/**
 * Middleware to ensure a user can only access their own resources
 * @param {String} paramIdField Request parameter field containing the resource owner ID
 */
exports.ensureOwnership = (paramIdField) => {
    return (req, res, next) => {
        const resourceOwnerId = req.params[paramIdField];

        // Admin can access any resource
        if (req.user.role === 'admin') {
            return next();
        }

        // For other roles, check if user is the owner
        if (req.user.id.toString() !== resourceOwnerId) {
            return res.status(403).json({
                message: 'You are not authorized to access this resource.'
            });
        }

        next();
    };
};

/**
 * Middleware to handle appointment access
 * Only the involved patient, doctor, or an admin can access appointment details
 */
exports.ensureAppointmentAccess = async (req, res, next) => {
    try {
        const appointmentId = req.params.id;

        // Admin can access any appointment
        if (req.user.role === 'admin') {
            return next();
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                message: 'Appointment not found.'
            });
        }

        // Check if user is involved in the appointment
        const userId = req.user.id.toString();
        const isDoctor = req.user.role === 'doctor' && appointment.doctor.toString() === userId;
        const isPatient = req.user.role === 'patient' && appointment.patient.toString() === userId;

        if (!isDoctor && !isPatient) {
            return res.status(403).json({
                message: 'You are not authorized to access this appointment.'
            });
        }

        next();
    } catch (error) {
        console.error('Appointment access error:', error);
        return res.status(500).json({
            message: 'An error occurred while checking appointment access.'
        });
    }
};

/**
 * Middleware to verify Telegram bot webhook
 */
exports.verifyTelegramWebhook = (req, res, next) => {
    try {
        const { secret } = req.query;

        // Check if secret matches configured value
        if (!secret || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
            return res.status(403).json({
                message: 'Unauthorized webhook request'
            });
        }

        next();
    } catch (error) {
        console.error('Telegram webhook verification error:', error);
        return res.status(500).json({
            message: 'An error occurred during webhook verification.'
        });
    }
};

module.exports = exports;