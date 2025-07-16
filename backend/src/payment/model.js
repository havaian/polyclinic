const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    session: {
        type: Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
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
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'uzs'
    },
    status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed', 'canceled'],
        default: 'pending'
    },
    stripeSessionId: {
        type: String
    },
    checkoutUrl: {
        type: String
    },
    paidAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for faster queries
paymentSchema.index({ session: 1 });
paymentSchema.index({ client: 1 });
paymentSchema.index({ provider: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ stripeSessionId: 1 });

// Add legacy fields for backward compatibility
paymentSchema.virtual('appointment').get(function() {
    return this.session;
});

// Ensure virtual fields are included in JSON
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;