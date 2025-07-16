const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the chat message schema
const chatMessageSchema = new Schema({
    sender: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Main session schema (formerly appointmentSchema)
const sessionSchema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: function () {
            return this.dateTime !== undefined;
        },
        default: function () {
            return this.dateTime ? new Date(this.dateTime.getTime() + 30 * 60000) : undefined;
        }
    },
    duration: {
        type: Number,
        default: 30, // Duration in minutes, must be a multiple of 15
        min: 15,
        max: 120,
        validate: {
            validator: function (value) {
                return value % 15 === 0;
            },
            message: 'Duration must be a multiple of 15 minutes'
        }
    },
    status: {
        type: String,
        enum: ['pending-payment', 'pending-provider-confirmation', 'scheduled', 'completed', 'canceled', 'no-show'],
        default: 'pending-provider-confirmation'
    },
    type: {
        type: String,
        enum: ['video', 'audio', 'chat'],
        required: true
    },
    purpose: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    sessionSummary: {
        type: String
    },
    // Chat log for the session
    chatLog: [chatMessageSchema],
    
    // Recommendations (formerly prescriptions)
    recommendations: [{
        title: String,
        description: String,
        type: String, // 'action', 'resource', 'followup', etc.
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        dueDate: Date,
        instructions: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Follow-up session information
    followUp: {
        recommended: Boolean,
        date: Date,
        notes: String
    },
    
    // Payment information
    payment: {
        amount: Number,
        status: {
            type: String,
            enum: ['pending', 'completed', 'refunded'],
            default: 'pending'
        },
        transactionId: String
    },
    
    // Document attachments
    documents: [{
        name: String,
        fileUrl: String,
        fileType: String,
        uploadedBy: {
            type: String,
            enum: ['client', 'provider']
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Cancellation information
    cancellationReason: {
        type: String
    },
    
    // Provider confirmation expiration
    providerConfirmationExpires: {
        type: Date
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
sessionSchema.index({ client: 1, dateTime: -1 });
sessionSchema.index({ provider: 1, dateTime: -1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ providerConfirmationExpires: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Middleware to update the updatedAt field
sessionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    
    // Set endTime based on dateTime and duration if not explicitly set
    if (this.dateTime && this.duration && !this.isModified('endTime')) {
        this.endTime = new Date(this.dateTime.getTime() + this.duration * 60000);
    }
    
    next();
});

// Instance methods
sessionSchema.methods.cancel = function (reason) {
    this.status = 'canceled';
    if (reason) {
        this.cancellationReason = reason;
    }
    return this.save();
};

sessionSchema.methods.complete = function (summary) {
    this.status = 'completed';
    if (summary) {
        this.sessionSummary = summary;
    }
    return this.save();
};

sessionSchema.methods.confirmProvider = function () {
    if (this.status === 'pending-provider-confirmation') {
        this.status = 'scheduled';
    }
    return this.save();
};

// Static methods
sessionSchema.statics.findUpcomingForClient = function (clientId) {
    return this.find({
        client: clientId,
        dateTime: { $gte: new Date() },
        status: 'scheduled'
    }).sort({ dateTime: 1 }).populate('provider');
};

sessionSchema.statics.findUpcomingForProvider = function (providerId) {
    return this.find({
        provider: providerId,
        dateTime: { $gte: new Date() },
        status: 'scheduled'
    }).sort({ dateTime: 1 }).populate('client');
};

// Find pending-payment follow-ups for a client
sessionSchema.statics.findPendingFollowUpsForClient = function (clientId) {
    return this.find({
        client: clientId,
        status: 'pending-payment'
    }).sort({ dateTime: 1 }).populate('provider');
};

// Find sessions pending provider confirmation
sessionSchema.statics.findPendingProviderConfirmation = function (providerId) {
    return this.find({
        provider: providerId,
        status: 'pending-provider-confirmation',
        providerConfirmationExpires: { $gt: new Date() }
    }).sort({ providerConfirmationExpires: 1 }).populate('client');
};

// Find expired provider confirmation sessions
sessionSchema.statics.findExpiredProviderConfirmation = function () {
    return this.find({
        status: 'pending-provider-confirmation',
        providerConfirmationExpires: { $lte: new Date() }
    }).populate('client').populate('provider');
};

// Find sessions for calendar view
sessionSchema.statics.findForCalendar = function (userId, userRole, startDate, endDate) {
    const query = {};
    
    if (userRole === 'client') {
        query.client = userId;
    } else if (userRole === 'provider') {
        query.provider = userId;
    }
    
    if (startDate && endDate) {
        query.dateTime = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }
    
    return this.find(query)
        .sort({ dateTime: 1 })
        .populate(userRole === 'client' ? 'provider' : 'client');
};

// Legacy methods for backward compatibility
sessionSchema.statics.findUpcomingForPatient = function (patientId) {
    return this.findUpcomingForClient(patientId);
};

sessionSchema.statics.findUpcomingForDoctor = function (doctorId) {
    return this.findUpcomingForProvider(doctorId);
};

sessionSchema.statics.findPendingFollowUpsForPatient = function (patientId) {
    return this.findPendingFollowUpsForClient(patientId);
};

sessionSchema.statics.findPendingDoctorConfirmation = function (doctorId) {
    return this.findPendingProviderConfirmation(doctorId);
};

sessionSchema.statics.findExpiredDoctorConfirmation = function () {
    return this.findExpiredProviderConfirmation();
};

// Create models with both names for transition period
const Session = mongoose.model('Session', sessionSchema);
const Appointment = mongoose.model('Appointment', sessionSchema); // Legacy alias

module.exports = { Session, Appointment };