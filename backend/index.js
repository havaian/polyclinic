const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
// Temporarily disable problematic middleware
// const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
require('./db');

const WebRTCService = require('./src/webrtc/service');

// Import routes
const userRoutes = require('./src/user/routes');
const appointmentRoutes = require('./src/appointment/routes');
const telegramRoutes = require('./src/bot/routes');
const assistantRoutes = require('./src/assistant/routes');
const paymentRoutes = require('./src/payment/routes');
const { initializeConsultationRoutes } = require('./src/consultation/routes');
const adminRoutes = require('./src/admin/routes');
const specializationRoutes = require('./src/specialization/routes');

// Initialize express app
const app = express();

// Middleware
// Enable CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : true,
    credentials: true
}));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Stripe webhook needs raw body for signature verification
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const paymentController = require('./payment/controller');
    paymentController.handleStripeWebhook(req, res);
});

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Custom sanitize middleware (instead of express-mongo-sanitize)
app.use((req, res, next) => {
    if (!req.body) return next();

    // Function to sanitize object
    const sanitize = (obj) => {
        const result = {};

        Object.keys(obj).forEach(key => {
            // Check for MongoDB operators starting with $
            if (key[0] === '$') {
                console.warn(`Potentially harmful key detected and sanitized: ${key}`);
                result[`_${key.slice(1)}`] = obj[key];
            }
            // Handle nested objects and arrays
            else if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (Array.isArray(obj[key])) {
                    result[key] = obj[key].map(item =>
                        typeof item === 'object' && item !== null ? sanitize(item) : item
                    );
                } else {
                    result[key] = sanitize(obj[key]);
                }
            }
            // Regular properties
            else {
                result[key] = obj[key];
            }
        });

        return result;
    };

    // Apply sanitization to body, query, and params
    if (req.body && typeof req.body === 'object') {
        req.body = sanitize(req.body);
    }

    if (req.query && typeof req.query === 'object') {
        const sanitizedQuery = sanitize(req.query);
        // Safely copy sanitized properties
        Object.keys(req.query).forEach(key => {
            delete req.query[key];
        });
        Object.keys(sanitizedQuery).forEach(key => {
            req.query[key] = sanitizedQuery[key];
        });
    }

    if (req.params && typeof req.params === 'object') {
        const sanitizedParams = sanitize(req.params);
        // Safely copy sanitized properties
        Object.keys(req.params).forEach(key => {
            delete req.params[key];
        });
        Object.keys(sanitizedParams).forEach(key => {
            req.params[key] = sanitizedParams[key];
        });
    }

    next();
});

// Custom XSS protection middleware (instead of xss-clean)
app.use((req, res, next) => {
    if (!req.body) return next();

    // Function to sanitize strings (basic HTML escape)
    const sanitizeXSS = (str) => {
        if (typeof str !== 'string') return str;
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    };

    // Function to sanitize object
    const sanitizeObj = (obj) => {
        const result = {};

        Object.keys(obj).forEach(key => {
            // Handle nested objects and arrays
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (Array.isArray(obj[key])) {
                    result[key] = obj[key].map(item =>
                        typeof item === 'object' && item !== null ? sanitizeObj(item) :
                            typeof item === 'string' ? sanitizeXSS(item) : item
                    );
                } else {
                    result[key] = sanitizeObj(obj[key]);
                }
            }
            // Sanitize strings
            else if (typeof obj[key] === 'string') {
                result[key] = sanitizeXSS(obj[key]);
            }
            // Keep other types as is
            else {
                result[key] = obj[key];
            }
        });

        return result;
    };

    // Apply sanitization to body
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObj(req.body);
    }

    next();
});

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// Create HTTP server (needs to be before the app.listen call)
const server = require('http').createServer(app);

// Initialize WebRTC service
const webRTCService = new WebRTCService(server);

// Initialize and register consultation routes
const consultationRoutes = initializeConsultationRoutes(webRTCService);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/specializations', specializationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    res.status(statusCode).json({
        status,
        message: err.message || 'Internal server error'
    });
});

// Start server
// Use server.listen instead of app.listen
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ PORT ${PORT}`);
    console.log(`✅ ${(process.env.NODE_ENV).toUpperCase()} mode`);
});

// require("./seed");

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
    console.error('UNHANDLED REJECTION:', err);
    // Log to external service like Sentry here

    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
    console.error('UNCAUGHT EXCEPTION:', err);
    // Log to external service like Sentry here

    // Close server & exit process
    process.exit(1);
});

// Export WebRTC service for testing
module.exports = {
    app,
    server,
    webRTCService
};