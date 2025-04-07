const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Schema = mongoose.Schema;

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
        select: false // Don't return password in queries by default
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        default: 'patient'
    },
    dateOfBirth: {
        type: Date,
        required: function () { return this.role === 'patient'; }
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer not to say'],
        required: function () { return this.role === 'patient'; }
    },
    profilePicture: {
        type: String,
        default: 'default.jpg'
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    // Doctor-specific fields
    specialization: {
        type: String,
        required: function () { return this.role === 'doctor'; }
    },
    licenseNumber: {
        type: String,
        required: function () { return this.role === 'doctor'; }
    },
    experience: {
        type: Number, // Years of experience
        default: 0,
        required: function () { return this.role === 'doctor'; }
    },
    education: [{
        degree: String,
        institution: String,
        year: Number
    }],
    languages: [{
        type: String
    }],
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    availability: [{
        dayOfWeek: Number, // 0 = Sunday, 1 = Monday, etc.
        isAvailable: Boolean,
        startTime: String, // Format: "HH:MM"
        endTime: String    // Format: "HH:MM"
    }],
    consultationFee: {
        amount: {
            type: Number,
            required: function () { return this.role === 'doctor'; }
        },
        currency: {
            type: String,
            default: 'UZS'
        }
    },
    // Patient-specific fields
    medicalHistory: {
        allergies: [String],
        chronicConditions: [String],
        currentMedications: [String],
        surgeries: [{
            procedure: String,
            year: Number
        }]
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
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
    telegramId: {
        type: String
    },
    telegramVerificationCode: String,
    telegramVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verificationToken: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Create a virtual field for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Add indexes for searching doctors - removed the duplicate email index
userSchema.index({ specialization: 1 });
userSchema.index({ 'address.city': 1 });
userSchema.index({ firstName: 'text', lastName: 'text', specialization: 'text' });

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    // Only hash the password if it's modified (or new)
    if (!this.isModified('password')) return next();

    try {
        // Generate salt
        const salt = await bcrypt.genSalt(10);

        // Hash password
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
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set token expire time (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Method to get doctor's basic public profile
userSchema.methods.getPublicProfile = function () {
    const user = this.toObject();

    // Remove sensitive information
    delete user.password;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpire;
    delete user.verificationToken;

    return user;
};

// Static method to find available doctors by specialization
userSchema.statics.findAvailableDoctors = function (specialization) {
    return this.find({
        role: 'doctor',
        isActive: true,
        isVerified: true,
        specialization: specialization || { $exists: true }
    }).select('-password');
};

const User = mongoose.model('User', userSchema);

module.exports = User;