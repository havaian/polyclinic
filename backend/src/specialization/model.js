const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const specializationSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String, // FontAwesome icon name or URL to custom icon
        default: 'fa-stethoscope'
    },
    isActive: {
        type: Boolean,
        default: true
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

// Index for faster searches
specializationSchema.index({ name: 1 });
specializationSchema.index({ isActive: 1 });

// Pre-save middleware to update timestamps
specializationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Specialization = mongoose.model('Specialization', specializationSchema);

module.exports = Specialization;