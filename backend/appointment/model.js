const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'canceled', 'no-show'],
        default: 'scheduled'
    },
    type: {
        type: String,
        enum: ['video', 'chat', 'voice'],
        required: true
    },
    reasonForVisit: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    consultationSummary: {
        type: String
    },
    prescriptions: [{
        medication: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String
    }],
    followUp: {
        recommended: Boolean,
        date: Date
    },
    payment: {
        amount: Number,
        status: {
            type: String,
            enum: ['pending', 'completed', 'refunded'],
            default: 'pending'
        },
        transactionId: String
    },
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
appointmentSchema.index({ patient: 1, dateTime: -1 });
appointmentSchema.index({ doctor: 1, dateTime: -1 });
appointmentSchema.index({ status: 1 });

// Middleware to update the updatedAt field
appointmentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Instance methods
appointmentSchema.methods.cancel = function () {
    this.status = 'canceled';
    return this.save();
};

appointmentSchema.methods.complete = function (summary) {
    this.status = 'completed';
    if (summary) {
        this.consultationSummary = summary;
    }
    return this.save();
};

// Static methods
appointmentSchema.statics.findUpcomingForPatient = function (patientId) {
    return this.find({
        patient: patientId,
        dateTime: { $gte: new Date() },
        status: 'scheduled'
    }).sort({ dateTime: 1 }).populate('doctor');
};

appointmentSchema.statics.findUpcomingForDoctor = function (doctorId) {
    return this.find({
        doctor: doctorId,
        dateTime: { $gte: new Date() },
        status: 'scheduled'
    }).sort({ dateTime: 1 }).populate('patient');
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;