const nodemailer = require('nodemailer');
const emailTemplates = require('./emailTemplates');

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

    async sendEmail(to, template) {
        try {
            const mailOptions = {
                from: `"E-polyclinic.uz" <${process.env.SMTP_FROM_EMAIL}>`,
                to,
                subject: template.subject,
                html: template.html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    // Appointment booked - send to both doctor and patient
    async sendAppointmentBookedEmails(appointment) {
        try {
            // Send to patient
            await this.sendEmail(
                appointment.patient.email,
                emailTemplates.appointmentBookedPatient(appointment)
            );

            // Send to doctor
            await this.sendEmail(
                appointment.doctor.email,
                emailTemplates.appointmentBookedDoctor(appointment)
            );
        } catch (error) {
            console.error('Error sending appointment booked emails:', error);
        }
    }

    // Appointment booking failed - send to patient
    async sendAppointmentFailedEmail(data) {
        try {
            await this.sendEmail(
                data.patient.email,
                emailTemplates.appointmentBookingFailed(data)
            );
        } catch (error) {
            console.error('Error sending appointment failed email:', error);
        }
    }

    // Appointment reminder - send to both doctor and patient
    async sendAppointmentReminderEmails(appointment) {
        try {
            // Send to patient
            await this.sendEmail(
                appointment.patient.email,
                emailTemplates.appointmentReminder({ ...appointment, doctor: appointment.doctor })
            );

            // Send to doctor
            await this.sendEmail(
                appointment.doctor.email,
                emailTemplates.appointmentReminder({ ...appointment, patient: appointment.patient })
            );
        } catch (error) {
            console.error('Error sending appointment reminder emails:', error);
        }
    }

    // Appointment cancelled - send to affected party
    async sendAppointmentCancelledEmails(appointment, cancelledBy) {
        try {
            // Send to patient
            await this.sendEmail(
                appointment.patient.email,
                emailTemplates.appointmentCancelled(appointment, cancelledBy)
            );

            // Send to doctor
            await this.sendEmail(
                appointment.doctor.email,
                emailTemplates.appointmentCancelled(appointment, cancelledBy)
            );
        } catch (error) {
            console.error('Error sending appointment cancelled emails:', error);
        }
    }
}

module.exports = new EmailService();