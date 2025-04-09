const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    appointment: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
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
    // For Stripe Checkout
    stripeSessionId: {
        type: String
    },
    checkoutUrl: {
        type: String
    },
    // For Payment Intents (if needed later)
    stripePaymentIntentId: {
        type: String
    },
    stripeClientSecret: {
        type: String,
        select: false // Not returned in queries by default for security
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'bank_transfer', 'cash'],
        default: 'card'
    },
    invoiceUrl: {
        type: String
    },
    invoiceId: {
        type: String
    },
    metadata: {
        type: Object
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
paymentSchema.index({ appointment: 1 });
paymentSchema.index({ patient: 1 });
paymentSchema.index({ doctor: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;