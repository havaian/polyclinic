const nodemailer = require('nodemailer');
const { format } = require('date-fns');

// Format currency amount
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS' }).format(amount);
};

// Format date and time
const formatDateTime = (date) => {
    return format(new Date(date), 'MMMM d, yyyy h:mm a');
};

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    async sendEmail(options) {
        try {
            const mailOptions = {
                from: `"dev.e-polyclinic.uz" <${process.env.SMTP_FROM_EMAIL}>`,
                to: options.to,
                subject: options.subject,
                text: options.text || '',
                html: options.html || ''
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    // Appointment booked - send to both provider and client
    async sendAppointmentBookedEmails(appointment) {
        try {
            const { provider, client, dateTime, type, payment } = appointment;

            // Email to client
            await this.sendEmail({
                to: client.email,
                subject: 'Appointment Confirmation - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a90e2;">Appointment Confirmed</h2>
                    <p>Your appointment with Dr. ${provider.firstName} ${provider.lastName} has been successfully booked.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Appointment Details</h3>
                        <p><strong>Provider:</strong> Dr. ${provider.firstName} ${provider.lastName}</p>
                        <p><strong>Specialization:</strong> ${provider.expertise.join(', ')}</p>
                        <p><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</p>
                        ${payment && payment.amount ? `<p><strong>Amount Paid:</strong> ${formatCurrency(payment.amount)}</p>` : ''}
                    </div>
                    
                    <p>Please make sure to join the session 5 minutes before the scheduled time.</p>
                    <p>You can view your appointment details and join the session by logging into your dev.e-polyclinic.uz account.</p>
                </div>
                `
            });

            // Email to provider
            await this.sendEmail({
                to: provider.email,
                subject: 'New Appointment Scheduled - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a90e2;">New Appointment</h2>
                    <p>A new appointment has been scheduled.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Appointment Details</h3>
                        <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
                        <p><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</p>
                    </div>
                    
                    <p>Please log in to your dev.e-polyclinic.uz account to view the complete appointment details.</p>
                </div>
                `
            });

            console.log('Appointment booking emails sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending appointment booked emails:', error);
            return false;
        }
    }

    // Appointment booking failed - send to client
    async sendAppointmentBookingFailed(data) {
        try {
            const { client, provider, dateTime, type, error } = data;

            await this.sendEmail({
                to: client.email,
                subject: 'Appointment Booking Failed - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #e74c3c;">Appointment Booking Failed</h2>
                    <p>Unfortunately, we couldn't complete your appointment booking.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Appointment Details</h3>
                        <p><strong>Provider:</strong> Dr. ${provider.firstName} ${provider.lastName}</p>
                        <p><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</p>
                        <p><strong>Reason:</strong> ${error}</p>
                    </div>
                    
                    <p>Please try booking again or contact our support if you need assistance.</p>
                </div>
                `
            });

            console.log('Appointment booking failed email sent');
            return true;
        } catch (error) {
            console.error('Error sending appointment booking failed email:', error);
            return false;
        }
    }

    // Appointment reminder - send to both provider and client
    async sendAppointmentReminderEmails(appointment) {
        try {
            const { provider, client, dateTime, type } = appointment;

            // Email to client
            await this.sendEmail({
                to: client.email,
                subject: 'Appointment Reminder - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a90e2;">Appointment Reminder</h2>
                    <p>This is a reminder about your upcoming appointment tomorrow.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Appointment Details</h3>
                        <p><strong>Provider:</strong> Dr. ${provider.firstName} ${provider.lastName}</p>
                        <p><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</p>
                    </div>
                    
                    <p>Please make sure to join the session 5 minutes before the scheduled time.</p>
                </div>
                `
            });

            // Email to provider
            await this.sendEmail({
                to: provider.email,
                subject: 'Appointment Reminder - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a90e2;">Appointment Reminder</h2>
                    <p>This is a reminder about your upcoming appointment tomorrow.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Appointment Details</h3>
                        <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
                        <p><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</p>
                    </div>
                    
                    <p>Please make sure to join the session 5 minutes before the scheduled time.</p>
                </div>
                `
            });

            console.log('Appointment reminder emails sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending appointment reminder emails:', error);
            return false;
        }
    }

    // Appointment cancelled - send to affected party
    async sendAppointmentCancelledEmails(appointment, cancelledBy) {
        try {
            const { provider, client, dateTime, type } = appointment;

            // Email to client
            await this.sendEmail({
                to: client.email,
                subject: 'Appointment Cancelled - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #e74c3c;">Appointment Cancelled</h2>
                    <p>The following appointment has been cancelled by ${cancelledBy}.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Appointment Details</h3>
                        <p><strong>Provider:</strong> Dr. ${provider.firstName} ${provider.lastName}</p>
                        <p><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</p>
                    </div>
                    
                    <p>You can schedule a new appointment through our website.</p>
                </div>
                `
            });

            // Email to provider
            await this.sendEmail({
                to: provider.email,
                subject: 'Appointment Cancelled - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #e74c3c;">Appointment Cancelled</h2>
                    <p>The following appointment has been cancelled by ${cancelledBy}.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Appointment Details</h3>
                        <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
                        <p><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</p>
                    </div>
                    
                    <p>The time slot is now available for other appointments.</p>
                </div>
                `
            });

            console.log('Appointment cancellation emails sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending appointment cancellation emails:', error);
            return false;
        }
    }

    // Send confirmation to provider about appointment being confirmed
    async sendAppointmentConfirmedEmails(appointment) {
        try {
            const { provider, client, dateTime, type } = appointment;

            // Email to client
            await this.sendEmail({
                to: client.email,
                subject: 'Appointment Confirmed by Provider - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a90e2;">Appointment Confirmed by Provider</h2>
                    <p>Your appointment has been confirmed by Dr. ${provider.firstName} ${provider.lastName}.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Appointment Details</h3>
                        <p><strong>Provider:</strong> Dr. ${provider.firstName} ${provider.lastName}</p>
                        <p><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</p>
                    </div>
                    
                    <p>Your appointment is now fully scheduled. You'll receive a reminder before the appointment time.</p>
                </div>
                `
            });

            // Email confirmation to provider
            await this.sendEmail({
                to: provider.email,
                subject: 'Appointment Confirmation Successful - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a90e2;">Appointment Confirmed</h2>
                    <p>You have successfully confirmed the appointment with ${client.firstName} ${client.lastName}.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Appointment Details</h3>
                        <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
                        <p><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</p>
                    </div>
                    
                    <p>The appointment is now scheduled in your calendar. You'll receive a reminder before the appointment time.</p>
                </div>
                `
            });

            console.log('Appointment confirmation emails sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending appointment confirmation emails:', error);
            return false;
        }
    }

    // Send payment success email to client
    async sendPaymentSuccessEmail(paymentId, appointment) {
        try {
            const { client, provider, dateTime, type } = appointment;

            await this.sendEmail({
                to: client.email,
                subject: 'Payment Successful - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a90e2;">Payment Successful</h2>
                    <p>Your payment for the appointment has been processed successfully.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Appointment Details</h3>
                        <p><strong>Provider:</strong> Dr. ${provider.firstName} ${provider.lastName}</p>
                        <p><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</p>
                        <p><strong>Payment ID:</strong> ${paymentId}</p>
                    </div>
                    
                    <p>Your appointment is now awaiting provider confirmation. You'll receive a notification once confirmed.</p>
                </div>
                `
            });

            console.log('Payment success email sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending payment success email:', error);
            return false;
        }
    }

    // Send payment confirmation email
    async sendPaymentConfirmation(paymentId) {
        try {
            // Fetch payment information first
            const Payment = require('../payment/model');
            const payment = await Payment.findById(paymentId)
                .populate({
                    path: 'appointment',
                    populate: {
                        path: 'client provider',
                        select: 'firstName lastName email expertise'
                    }
                });

            if (!payment || !payment.appointment) {
                throw new Error('Payment or appointment information not found');
            }

            const { client, provider, dateTime, type } = payment.appointment;

            await this.sendEmail({
                to: client.email,
                subject: 'Payment Confirmation - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a90e2;">Payment Confirmation</h2>
                    <p>This is a confirmation of your payment for the following appointment:</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Payment Details</h3>
                        <p><strong>Payment ID:</strong> ${payment._id}</p>
                        <p><strong>Amount:</strong> ${formatCurrency(payment.amount)}</p>
                        <p><strong>Status:</strong> ${payment.status}</p>
                        <p><strong>Provider:</strong> Dr. ${provider.firstName} ${provider.lastName}</p>
                        <p><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</p>
                    </div>
                    
                    <p>Thank you for your payment. Your appointment is now confirmed.</p>
                </div>
                `
            });

            console.log('Payment confirmation email sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending payment confirmation email:', error);
            return false;
        }
    }

    // Send payment refund notification
    async sendPaymentRefundNotification(payment) {
        try {
            await payment.populate({
                path: 'appointment',
                populate: {
                    path: 'client provider',
                    select: 'firstName lastName email expertise'
                }
            });

            const { client, provider, dateTime, type } = payment.appointment;

            await this.sendEmail({
                to: client.email,
                subject: 'Payment Refund - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a90e2;">Payment Refund</h2>
                    <p>Your payment has been refunded for the following cancelled appointment:</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Refund Details</h3>
                        <p><strong>Payment ID:</strong> ${payment._id}</p>
                        <p><strong>Amount:</strong> ${formatCurrency(payment.amount)}</p>
                        <p><strong>Provider:</strong> Dr. ${provider.firstName} ${provider.lastName}</p>
                        <p><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</p>
                    </div>
                    
                    <p>The refund will be processed according to your payment method's standard processing times.</p>
                    <p>If you have any questions about this refund, please contact our support team.</p>
                </div>
                `
            });

            console.log('Payment refund email sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending payment refund email:', error);
            return false;
        }
    }

    // Send prescription notification
    async sendPrescriptionNotification(appointment) {
        try {
            await appointment.populate('client provider');

            const { client, provider, recommendations } = appointment;

            // Format recommendations for email
            let recommendationsHtml = '';
            recommendations.forEach((prescription, index) => {
                recommendationsHtml += `
                <div style="border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px;">
                    <p><strong>Medication:</strong> ${prescription.medication}</p>
                    <p><strong>Dosage:</strong> ${prescription.dosage}</p>
                    <p><strong>Frequency:</strong> ${prescription.frequency}</p>
                    <p><strong>Duration:</strong> ${prescription.duration}</p>
                    ${prescription.instructions ? `<p><strong>Instructions:</strong> ${prescription.instructions}</p>` : ''}
                </div>
                `;
            });

            await this.sendEmail({
                to: client.email,
                subject: 'New Recommendations from Your Provider - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a90e2;">New Recommendations</h2>
                    <p>Dr. ${provider.firstName} ${provider.lastName} has prescribed the following medication(s) after your session:</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        ${recommendationsHtml}
                    </div>
                    
                    <p>You can view these recommendations at any time by logging into your dev.e-polyclinic.uz account.</p>
                    <p><strong>Note:</strong> Always follow your provider's instructions when taking medications.</p>
                </div>
                `
            });

            console.log('Prescription notification email sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending prescription notification email:', error);
            return false;
        }
    }

    // Send follow-up notification
    async sendFollowUpNotification(followUpAppointment) {
        try {
            await followUpAppointment.populate('client provider');

            const { client, provider, dateTime, type, purpose } = followUpAppointment;

            await this.sendEmail({
                to: client.email,
                subject: 'Follow-up Appointment Recommended - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a90e2;">Follow-up Appointment</h2>
                    <p>Dr. ${provider.firstName} ${provider.lastName} has recommended a follow-up appointment:</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Appointment Details</h3>
                        <p><strong>Provider:</strong> Dr. ${provider.firstName} ${provider.lastName}</p>
                        <p><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</p>
                        <p><strong>Reason:</strong> ${purpose}</p>
                    </div>
                    
                    <p>This appointment requires payment confirmation. Please log in to your dev.e-polyclinic.uz account to confirm and complete payment for this follow-up appointment.</p>
                </div>
                `
            });

            await this.sendEmail({
                to: provider.email,
                subject: 'Follow-up Appointment Created - dev.e-polyclinic.uz',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a90e2;">Follow-up Appointment Created</h2>
                    <p>You have successfully created a follow-up appointment for ${client.firstName} ${client.lastName}:</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Appointment Details</h3>
                        <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
                        <p><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Session</p>
                        <p><strong>Reason:</strong> ${purpose}</p>
                    </div>
                    
                    <p>The client has been notified and needs to confirm the appointment by completing payment.</p>
                </div>
                `
            });

            console.log('Follow-up notification emails sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending follow-up notification emails:', error);
            return false;
        }
    }
}

// Create a singleton instance
const emailService = new EmailService();

module.exports = emailService;