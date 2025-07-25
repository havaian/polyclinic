const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
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
    appointment: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    // Specific rating categories
    communicationRating: {
        type: Number,
        min: 1,
        max: 5
    },
    professionalismRating: {
        type: Number,
        min: 1,
        max: 5
    },
    satisfactionRating: {
        type: Number,
        min: 1,
        max: 5
    },
    // Admin moderation fields
    isApproved: {
        type: Boolean,
        default: true // Auto-approve by default, can be changed for moderation
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    // Provider response to review
    providerResponse: {
        text: {
            type: String,
            trim: true
        },
        respondedAt: {
            type: Date
        }
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

// Ensure a client can only leave one review per appointment
reviewSchema.index({ client: 1, appointment: 1 }, { unique: true });

// Add indexes for frequent queries
reviewSchema.index({ provider: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ rating: 1 });

// Prevent clients from reviewing their own appointments multiple times
reviewSchema.pre('save', async function (next) {
    if (this.isNew) {
        const existingReview = await this.constructor.findOne({
            client: this.client,
            appointment: this.appointment
        });

        if (existingReview) {
            const error = new Error('You have already reviewed this appointment');
            error.status = 400;
            return next(error);
        }
    }

    this.updatedAt = Date.now();
    next();
});

// Static method to get provider's average rating
reviewSchema.statics.getProviderRating = async function (providerId) {
    const result = await this.aggregate([
        {
            $match: {
                provider: mongoose.Types.ObjectId(providerId),
                isApproved: true
            }
        },
        {
            $group: {
                _id: '$provider',
                averageRating: { $avg: '$rating' },
                communicationRating: { $avg: '$communicationRating' },
                professionalismRating: { $avg: '$professionalismRating' },
                satisfactionRating: { $avg: '$satisfactionRating' },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    return result.length ? result[0] : {
        averageRating: 0,
        communicationRating: 0,
        professionalismRating: 0,
        satisfactionRating: 0,
        reviewCount: 0
    };
};

// Static method to get recent reviews for a provider
reviewSchema.statics.getRecentReviews = async function (providerId, limit = 5) {
    return this.find({
        provider: providerId,
        isApproved: true
    })
        .populate('client', 'firstName lastName profilePicture')
        .sort({ createdAt: -1 })
        .limit(limit);
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;