const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('./model');
const Appointment = require('../appointment/model');
const User = require('../user/model');
const { NotificationService } = require('../notification');

/**
 * Create a checkout session for an appointment
 */
exports.createCheckoutSession = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({ message: 'Appointment ID is required' });
        }

        // Find appointment
        const appointment = await Appointment.findById(appointmentId)
            .populate('doctor', 'consultationFee firstName lastName email specialization')
            .populate('patient', 'firstName lastName email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if appointment already has a payment
        const existingPayment = await Payment.findOne({
            appointment: appointmentId,
            status: { $in: ['pending', 'succeeded'] }
        });

        if (existingPayment && existingPayment.status === 'succeeded') {
            return res.status(400).json({
                message: 'Payment already completed for this appointment',
                paymentId: existingPayment._id,
                status: existingPayment.status
            });
        }

        // If there's a pending payment with checkout URL, return it
        if (existingPayment && existingPayment.status === 'pending' && existingPayment.checkoutUrl) {
            return res.status(200).json({
                paymentId: existingPayment._id,
                checkoutUrl: existingPayment.checkoutUrl,
                status: 'pending'
            });
        }

        // Get consultation fee from doctor's profile
        const amount = appointment.doctor.consultationFee.amount;
        const currency = appointment.doctor.consultationFee.currency || 'uzs';

        // Format appointment date for display
        const appointmentDate = new Date(appointment.dateTime).toLocaleString();

        // Create a checkout session with Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: `Medical Consultation with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
                            description: `${appointment.doctor.specialization} - ${appointmentDate}`
                        },
                        unit_amount: amount * 100, // Stripe uses smallest currency unit
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                appointmentId: appointment._id.toString(),
                patientId: appointment.patient._id.toString(),
                doctorId: appointment.doctor._id.toString(),
                appointmentDate: appointment.dateTime.toISOString()
            },
            customer_email: appointment.patient.email,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
        });

        // Create or update payment record in database
        let payment;

        if (existingPayment) {
            payment = existingPayment;
            payment.stripeSessionId = session.id;
            payment.checkoutUrl = session.url;
        } else {
            payment = new Payment({
                appointment: appointment._id,
                patient: appointment.patient._id,
                doctor: appointment.doctor._id,
                amount,
                currency,
                stripeSessionId: session.id,
                checkoutUrl: session.url,
                status: 'pending',
                metadata: {
                    appointmentDate: appointment.dateTime
                }
            });
        }

        await payment.save();

        // Update appointment with payment information
        appointment.payment = {
            amount,
            status: 'pending',
            transactionId: payment._id
        };

        await appointment.save();

        res.status(200).json({
            paymentId: payment._id,
            checkoutUrl: session.url,
            status: 'pending'
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({
            message: 'Failed to create checkout session',
            error: error.message
        });
    }
};

/**
 * Handle webhook events from Stripe
 */
exports.handleStripeWebhook = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        let event;

        // Verify webhook signature
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'checkout.session.expired':
                await handleCheckoutSessionExpired(event.data.object);
                break;
            // You can add more event handlers as needed
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Handle completed checkout session
 */
async function handleCheckoutSessionCompleted(session) {
    try {
        // Find payment by session ID
        const payment = await Payment.findOne({ stripeSessionId: session.id });

        if (!payment) {
            console.error('Payment not found for session:', session.id);
            return;
        }

        // Update payment status
        payment.status = 'succeeded';
        payment.paidAt = new Date();
        await payment.save();

        // Update appointment payment status
        const appointment = await Appointment.findById(payment.appointment);
        if (appointment) {
            appointment.payment.status = 'completed';
            await appointment.save();

            // Generate invoice
            const invoice = await generateInvoice(payment._id);

            // Send payment confirmation
            await sendPaymentConfirmation(payment._id);
        }
    } catch (error) {
        console.error('Error handling completed checkout session:', error);
    }
}

/**
 * Handle expired checkout session
 */
async function handleCheckoutSessionExpired(session) {
    try {
        // Find payment by session ID
        const payment = await Payment.findOne({ stripeSessionId: session.id });

        if (!payment) {
            console.error('Payment not found for session:', session.id);
            return;
        }

        // Update payment status
        payment.status = 'failed';
        await payment.save();

        // Update appointment payment status if needed
        const appointment = await Appointment.findById(payment.appointment);
        if (appointment && appointment.payment.status === 'pending') {
            appointment.payment.status = 'pending'; // Keep it pending so they can try again
            await appointment.save();
        }
    } catch (error) {
        console.error('Error handling expired checkout session:', error);
    }
}

/**
 * Get payment details
 */
exports.getPaymentDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await Payment.findById(id)
            .populate('appointment')
            .populate('patient', 'firstName lastName email')
            .populate('doctor', 'firstName lastName specialization');

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json({ payment });
    } catch (error) {
        console.error('Error getting payment details:', error);
        res.status(500).json({ message: 'Failed to get payment details' });
    }
};

/**
 * Verify payment session status
 */
exports.verifySessionStatus = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID is required' });
        }

        // Find payment by session ID
        const payment = await Payment.findOne({ stripeSessionId: sessionId });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found for this session' });
        }

        // If payment is still pending, check with Stripe
        if (payment.status === 'pending') {
            try {
                const session = await stripe.checkout.sessions.retrieve(sessionId);

                // Update payment status based on session status
                if (session.payment_status === 'paid') {
                    payment.status = 'succeeded';
                    payment.paidAt = new Date();
                    await payment.save();

                    // Update appointment
                    const appointment = await Appointment.findById(payment.appointment);
                    if (appointment) {
                        appointment.payment.status = 'completed';
                        await appointment.save();
                    }

                    // Generate invoice if not already generated
                    if (!payment.invoiceUrl) {
                        await generateInvoice(payment._id);
                    }
                }
            } catch (stripeError) {
                console.error('Error retrieving Stripe session:', stripeError);
                // Continue with local data if Stripe API fails
            }
        }

        // Refresh payment data after potential updates
        await payment.populate('appointment');
        await payment.populate('patient', 'firstName lastName email');
        await payment.populate('doctor', 'firstName lastName specialization');

        res.status(200).json({
            payment,
            success: payment.status === 'succeeded'
        });
    } catch (error) {
        console.error('Error verifying session status:', error);
        res.status(500).json({ message: 'Failed to verify payment session' });
    }
};

/**
 * Generate an invoice for completed payment
 */
exports.generateInvoice = async (req, res) => {
    try {
        const { paymentId } = req.params;

        if (!paymentId) {
            return res.status(400).json({ message: 'Payment ID is required' });
        }

        const invoiceUrl = await generateInvoice(paymentId);

        res.status(200).json({ invoiceUrl });
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({
            message: 'Failed to generate invoice',
            error: error.message
        });
    }
};

/**
 * Helper function to generate invoice
 */
async function generateInvoice(paymentId) {
    // Find payment with related data
    const payment = await Payment.findById(paymentId)
        .populate('appointment')
        .populate('patient', 'firstName lastName email')
        .populate('doctor', 'firstName lastName specialization email');

    if (!payment) {
        throw new Error('Payment not found');
    }

    // If payment already has an invoice URL, return it
    if (payment.invoiceUrl) {
        return payment.invoiceUrl;
    }

    // Make sure payment is successful before generating invoice
    if (payment.status !== 'succeeded') {
        throw new Error('Cannot generate invoice for unpaid payment');
    }

    // Create a customer in Stripe (or get existing one)
    let customer;
    try {
        // Try to find existing customer by email
        const customers = await stripe.customers.list({
            email: payment.patient.email,
            limit: 1
        });

        if (customers.data.length > 0) {
            customer = customers.data[0];
        } else {
            // Create new customer
            customer = await stripe.customers.create({
                email: payment.patient.email,
                name: `${payment.patient.firstName} ${payment.patient.lastName}`,
                metadata: {
                    patientId: payment.patient._id.toString()
                }
            });
        }
    } catch (error) {
        console.error('Error creating/finding Stripe customer:', error);
        throw error;
    }

    // Format appointment date
    const appointmentDate = new Date(payment.appointment.dateTime).toLocaleDateString();

    // Create invoice item
    const invoiceItem = await stripe.invoiceItems.create({
        customer: customer.id,
        amount: payment.amount * 100, // Stripe uses smallest currency unit
        currency: payment.currency,
        description: `Medical Consultation with Dr. ${payment.doctor.firstName} ${payment.doctor.lastName} (${payment.doctor.specialization}) on ${appointmentDate}`,
    });

    // Create and finalize invoice
    const invoice = await stripe.invoices.create({
        customer: customer.id,
        auto_advance: true, // Auto-finalize and send the invoice
        collection_method: 'send_invoice',
        days_until_due: 30,
        metadata: {
            appointmentId: payment.appointment._id.toString(),
            paymentId: payment._id.toString()
        }
    });

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    // Send the invoice by email
    await stripe.invoices.sendInvoice(finalizedInvoice.id);

    // Update payment with invoice details
    payment.invoiceUrl = finalizedInvoice.hosted_invoice_url;
    payment.invoiceId = finalizedInvoice.id;
    await payment.save();

    return finalizedInvoice.hosted_invoice_url;
}

/**
 * Send payment confirmation
 */
async function sendPaymentConfirmation(paymentId) {
    try {
        const payment = await Payment.findById(paymentId)
            .populate('appointment')
            .populate('patient', 'firstName lastName email telegramId')
            .populate('doctor', 'firstName lastName specialization email telegramId');

        if (!payment) {
            console.error('Payment not found for confirmation:', paymentId);
            return;
        }

        const appointmentDate = new Date(payment.appointment.dateTime).toLocaleString();
        const formattedAmount = new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: payment.currency.toUpperCase()
        }).format(payment.amount);

        // Email to patient
        const patientEmailData = {
            to: payment.patient.email,
            subject: 'Payment Confirmation - E-polyclinic.uz',
            text: `Your payment of ${formattedAmount} for the appointment with Dr. ${payment.doctor.firstName} ${payment.doctor.lastName} on ${appointmentDate} has been confirmed.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a90e2;">Payment Confirmation</h2>
                    <p>Your payment has been successfully processed.</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Amount:</strong> ${formattedAmount}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Doctor:</strong> Dr. ${payment.doctor.firstName} ${payment.doctor.lastName}</p>
                        <p><strong>Appointment:</strong> ${appointmentDate}</p>
                    </div>
                    <p>You can view your invoice <a href="${payment.invoiceUrl}">here</a>.</p>
                </div>
            `
        };

        // Queue emails
        NotificationService.queueEmail(patientEmailData);

        // If patient has Telegram account linked, send notification there too
        if (payment.patient.telegramId) {
            const telegramData = {
                chatId: payment.patient.telegramId,
                text: `✅ Your payment of ${formattedAmount} for the appointment with Dr. ${payment.doctor.firstName} ${payment.doctor.lastName} on ${appointmentDate} has been confirmed. You can view your invoice at: ${payment.invoiceUrl}`,
                options: {
                    parse_mode: 'HTML'
                }
            };
            NotificationService.queueTelegramMessage(telegramData);
        }
    } catch (error) {
        console.error('Error sending payment confirmation:', error);
    }
}

/**
 * Get all payments for a patient
 */
exports.getPatientPayments = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { status, limit = 10, skip = 0 } = req.query;

        const query = { patient: patientId };
        if (status) {
            query.status = status;
        }

        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate({
                path: 'appointment',
                select: 'dateTime type status'
            })
            .populate({
                path: 'doctor',
                select: 'firstName lastName specialization'
            });

        const total = await Payment.countDocuments(query);

        res.status(200).json({
            payments,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip)
            }
        });
    } catch (error) {
        console.error('Error fetching patient payments:', error);
        res.status(500).json({ message: 'Failed to fetch payments' });
    }
};

/**
 * Get all payments for a doctor
 */
exports.getDoctorPayments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { status, limit = 10, skip = 0 } = req.query;

        const query = { doctor: doctorId };
        if (status) {
            query.status = status;
        }

        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate({
                path: 'appointment',
                select: 'dateTime type status'
            })
            .populate({
                path: 'patient',
                select: 'firstName lastName'
            });

        const total = await Payment.countDocuments(query);

        res.status(200).json({
            payments,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip)
            }
        });
    } catch (error) {
        console.error('Error fetching doctor payments:', error);
        res.status(500).json({ message: 'Failed to fetch payments' });
    }
};