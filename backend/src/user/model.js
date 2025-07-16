const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Schema = mongoose.Schema;

// Time slot schema for provider availability
const timeSlotSchema = new Schema({
    startTime: {
        type: String, // Format: "HH:MM"
        required: true
    },
    endTime: {
        type: String, // Format: "HH:MM"
        required: true
    }
});

const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ['client', 'provider', 'admin'],
        default: 'client'
    },
    dateOfBirth: {
        type: Date,
        required: function () { return this.role === 'client'; }
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer not to say'],
        required: function () { return this.role === 'client'; }
    },
    profilePicture: {
        type: String,
        default: '/images/user-placeholder.jpg'
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    
    // Provider-specific fields (formerly doctor fields)
    expertise: [{
        type: String,
        required: function () { return this.role === 'provider'; }
    }],
    licenseNumber: {
        type: String,
        required: function () { return this.role === 'provider'; }
    },
    experience: {
        type: Number,
        default: 0,
        required: function () { return this.role === 'provider'; }
    },
    education: [{
        degree: String,
        institution: String,
        year: Number
    }],
    certifications: [{
        name: String,
        issuer: String,
        year: Number,
        file: String // URL or path to the uploaded certificate file
    }],
    languages: [{
        type: String
    }],
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    availability: [{
        dayOfWeek: Number, // 0 = Monday, 6 = Sunday
        isAvailable: Boolean,
        // Legacy fields - kept for backward compatibility
        startTime: String, // Format: "HH:MM"
        endTime: String,   // Format: "HH:MM"
        // New field - multiple time slots per day
        timeSlots: [timeSlotSchema]
    }],
    sessionFee: {
        type: Number,
        required: function () { return this.role === 'provider'; }
    },
    
    // Client-specific fields (formerly patient fields)
    history: {
        notes: [String],
        conditions: [String],
        preferences: [String],
        records: [{
            type: String,
            date: Date,
            notes: String
        }]
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },
    
    // Agreement to terms
    termsAccepted: {
        type: Boolean,
        default: false
    },
    privacyPolicyAccepted: {
        type: Boolean,
        default: false
    },
    termsAcceptedAt: {
        type: Date
    },
    
    // Common fields
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    verificationToken: {
        type: String
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    lastLogin: {
        type: Date
    },
    
    // JWT security
    jwtSecret: {
        type: String,
        default: function () {
            return crypto.randomBytes(32).toString('hex');
        }
    },
    jwtSecretCreatedAt: {
        type: Date,
        default: Date.now
    },
    
    // Telegram integration
    telegramId: {
        type: String,
        unique: true,
        sparse: true
    },
    telegramUsername: {
        type: String
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ expertise: 1 });
userSchema.index({ telegramId: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to check if password matches
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        this.jwtSecret || process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Rotate JWT secret
userSchema.methods.rotateJwtSecret = function () {
    this.jwtSecret = crypto.randomBytes(32).toString('hex');
    this.jwtSecretCreatedAt = Date.now();
    return this.save();
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    return resetToken;
};

// Method to get provider's/client's public profile
userSchema.methods.getPublicProfile = function () {
    const user = this.toObject();
    
    // Remove sensitive information
    delete user.password;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpire;
    delete user.verificationToken;
    delete user.jwtSecret;
    
    return user;
};

// Static method to find available providers by expertise
userSchema.statics.findAvailableProviders = function (expertise) {
    return this.find({
        role: 'provider',
        isActive: true,
        isVerified: true,
        expertise: expertise || { $exists: true }
    }).select('-password');
};

// Static method to find providers by expertise (replaces findAvailableDoctors)
userSchema.statics.findAvailableDoctors = function (specializations) {
    // Legacy method - redirect to new method for backward compatibility
    return this.findAvailableProviders(specializations);
};

const User = mongoose.model('User', userSchema);

module.exports = User;