const Joi = require('joi');

/**
 * Validate user registration and update input
 * @param {Object} data User data for validation
 * @returns {Object} Validation result
 */
exports.validateUserInput = (data) => {
    // Define base schema for all users
    const baseSchema = {
        firstName: Joi.string().trim().min(2).max(50).required()
            .messages({
                'string.empty': 'First name is required',
                'string.min': 'First name must be at least 2 characters',
                'string.max': 'First name cannot exceed 50 characters'
            }),

        lastName: Joi.string().trim().min(2).max(50).required()
            .messages({
                'string.empty': 'Last name is required',
                'string.min': 'Last name must be at least 2 characters',
                'string.max': 'Last name cannot exceed 50 characters'
            }),

        email: Joi.string().trim().email().required()
            .messages({
                'string.empty': 'Email is required',
                'string.email': 'Please provide a valid email address'
            }),

        password: Joi.string().min(8).required()
            .messages({
                'string.empty': 'Password is required',
                'string.min': 'Password must be at least 8 characters long'
            }),

        phone: Joi.string().trim().required()
            .messages({
                'string.empty': 'Phone number is required'
            }),

        role: Joi.string().valid('client', 'provider', 'admin').optional()
            .messages({
                'any.only': 'Role must be either client, provider, or admin'
            }),

        profilePicture: Joi.string().uri().optional()
            .messages({
                'string.uri': 'Profile picture must be a valid URL'
            }),

        address: Joi.object({
            street: Joi.string().trim().optional(),
            city: Joi.string().trim().optional(),
            state: Joi.string().trim().optional(),
            zipCode: Joi.string().trim().optional(),
            country: Joi.string().trim().optional()
        }).optional(),

        termsAccepted: Joi.boolean().valid(true).optional()
            .messages({
                'any.only': 'Terms must be accepted'
            }),

        privacyPolicyAccepted: Joi.boolean().valid(true).optional()
            .messages({
                'any.only': 'Privacy policy must be accepted'
            })
    };

    // Define client-specific schema
    const clientSchema = {
        dateOfBirth: Joi.date().less('now').required()
            .messages({
                'date.base': 'Please provide a valid date of birth',
                'date.less': 'Date of birth must be in the past',
                'any.required': 'Date of birth is required for clients'
            }),

        gender: Joi.string().valid('male', 'female', 'other', 'prefer not to say').required()
            .messages({
                'any.only': 'Gender must be male, female, other, or prefer not to say',
                'any.required': 'Gender is required for clients'
            }),

        history: Joi.object({
            notes: Joi.array().items(Joi.string()).optional(),
            conditions: Joi.array().items(Joi.string()).optional(),
            preferences: Joi.array().items(Joi.string()).optional()
        }).optional(),

        emergencyContact: Joi.object({
            name: Joi.string().trim().optional(),
            relationship: Joi.string().trim().optional(),
            phone: Joi.string().trim().pattern(new RegExp('^[+]?[0-9]{10,15}$'))
                .messages({
                    'string.pattern.base': 'Emergency contact phone must be a valid phone number'
                }).optional()
        }).optional(),
    };

    // Define provider-specific schema
    const providerSchema = {
        expertise: Joi.array().items(Joi.string().trim()).min(1).required()
            .messages({
                'array.min': 'At least one area of expertise is required for providers'
            }),

        licenseNumber: Joi.string().trim().required()
            .messages({
                'string.empty': 'License number is required for providers'
            }),

        experience: Joi.number().integer().min(0).required()
            .messages({
                'number.base': 'Experience must be a number',
                'number.integer': 'Experience must be an integer',
                'number.min': 'Experience cannot be negative',
                'any.required': 'Experience is required for providers'
            }),

        sessionFee: Joi.number().positive().required()
            .messages({
                'number.base': 'Session fee must be a number',
                'number.positive': 'Session fee must be positive',
                'any.required': 'Session fee is required for providers'
            }),

        bio: Joi.string().trim().max(500).optional()
            .messages({
                'string.max': 'Bio cannot exceed 500 characters'
            }),

        languages: Joi.array().items(Joi.string().trim()).optional(),

        education: Joi.array().items(
            Joi.object({
                degree: Joi.string().trim().required(),
                institution: Joi.string().trim().required(),
                year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required()
            })
        ).optional(),
        
        certifications: Joi.array().items(
            Joi.object({
                name: Joi.string().trim().required(),
                issuer: Joi.string().trim().required(),
                year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required()
            })
        ).optional(),
        
        availability: Joi.array().items(
            Joi.object({
                dayOfWeek: Joi.number().integer().min(0).max(6).required(),
                isAvailable: Joi.boolean().required(),
                startTime: Joi.string().optional(),
                endTime: Joi.string().optional()
            })
        ).optional()
    };

    // Choose schema based on role
    let schemaToUse;
    if (data.role === 'provider') {
        schemaToUse = { ...baseSchema, ...providerSchema };
    } else {
        // Client role
        schemaToUse = { ...baseSchema, ...clientSchema };
    }

    // Create and return schema
    const schema = Joi.object(schemaToUse);
    return schema.validate(data, { abortEarly: false });
};

/**
 * Validate session booking input
 * @param {Object} data Session data for validation
 * @returns {Object} Validation result
 */
exports.validateSessionInput = (data) => {
    const schema = Joi.object({
        providerId: Joi.string().required()
            .messages({
                'string.empty': 'Provider ID is required',
                'any.required': 'Provider ID is required'
            }),

        dateTime: Joi.date().greater('now').required()
            .messages({
                'date.base': 'Please provide a valid date and time',
                'date.greater': 'Session date must be in the future',
                'any.required': 'Session date and time is required'
            }),

        duration: Joi.number().integer().min(15).max(120).multiple(15).required()
            .messages({
                'number.base': 'Duration must be a number',
                'number.integer': 'Duration must be an integer',
                'number.min': 'Duration must be at least 15 minutes',
                'number.max': 'Duration cannot exceed 120 minutes',
                'number.multiple': 'Duration must be a multiple of 15 minutes',
                'any.required': 'Duration is required'
            }),

        type: Joi.string().valid('video', 'audio', 'chat').required()
            .messages({
                'any.only': 'Session type must be video, audio, or chat',
                'any.required': 'Session type is required'
            }),

        purpose: Joi.string().trim().min(10).max(500).required()
            .messages({
                'string.empty': 'Purpose is required',
                'string.min': 'Purpose must be at least 10 characters',
                'string.max': 'Purpose cannot exceed 500 characters',
                'any.required': 'Purpose is required'
            }),

        notes: Joi.string().trim().max(1000).optional()
            .messages({
                'string.max': 'Notes cannot exceed 1000 characters'
            })
    });

    return schema.validate(data, { abortEarly: false });
};

/**
 * Validate login input
 * @param {Object} data Login data for validation
 * @returns {Object} Validation result
 */
exports.validateLoginInput = (data) => {
    const schema = Joi.object({
        email: Joi.string().trim().email().required()
            .messages({
                'string.empty': 'Email is required',
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            }),

        password: Joi.string().required()
            .messages({
                'string.empty': 'Password is required',
                'any.required': 'Password is required'
            })
    });

    return schema.validate(data, { abortEarly: false });
};

/**
 * Validate password reset input
 * @param {Object} data Password reset data for validation
 * @returns {Object} Validation result
 */
exports.validatePasswordResetInput = (data) => {
    const schema = Joi.object({
        email: Joi.string().trim().email().required()
            .messages({
                'string.empty': 'Email is required',
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            })
    });

    return schema.validate(data, { abortEarly: false });
};

/**
 * Validate new password input
 * @param {Object} data New password data for validation
 * @returns {Object} Validation result
 */
exports.validateNewPasswordInput = (data) => {
    const schema = Joi.object({
        password: Joi.string().min(8).required()
            .messages({
                'string.empty': 'Password is required',
                'string.min': 'Password must be at least 8 characters long',
                'any.required': 'Password is required'
            }),

        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
            .messages({
                'any.only': 'Confirm password must match password',
                'any.required': 'Confirm password is required'
            })
    });

    return schema.validate(data, { abortEarly: false });
};

// Legacy exports for backward compatibility
exports.validateAppointmentInput = exports.validateSessionInput;