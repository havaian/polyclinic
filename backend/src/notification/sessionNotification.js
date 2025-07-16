/**
 * Send notification when a session is automatically completed
 * @param {Object} appointment - Appointment object with populated client and provider
 */
exports.sendSessionCompletedNotification = async (appointment) => {
    try {
        if (!appointment) {
            console.error('Error: No appointment provided for session completed notification');
            return;
        }

        // Make sure client and provider are populated
        const client = appointment.client;
        const provider = appointment.provider;

        if (!client || !provider) {
            console.error('Error: Client or provider not populated in appointment for notification');
            return;
        }

        // Send email to client
        await emailService.sendEmail({
            to: client.email,
            subject: 'Your Session Has Ended - E-Polyclinic',
            text: `Your session with Dr. ${provider.firstName} ${provider.lastName} has ended. 
            If you need to schedule a follow-up appointment, please visit our website.`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4a90e2;">Session Ended</h2>
              <p>Dear ${client.firstName} ${client.lastName},</p>
              <p>Your session with Dr. ${provider.firstName} ${provider.lastName} has ended.</p>
              <p><strong>Date:</strong> ${new Date(appointment.dateTime).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date(appointment.dateTime).toLocaleTimeString()} - ${new Date(appointment.endTime).toLocaleTimeString()}</p>
              <p>If you need to schedule a follow-up appointment, please visit our website.</p>
              <p>Thank you for choosing E-Polyclinic for your healthcare needs.</p>
            </div>
            `
        });

        // Send email to provider
        await emailService.sendEmail({
            to: provider.email,
            subject: 'Session Completed - E-Polyclinic',
            text: `Your session with ${client.firstName} ${client.lastName} has ended. 
            Please complete your session summary if you haven't already done so.`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4a90e2;">Session Completed</h2>
              <p>Dear Dr. ${provider.firstName} ${provider.lastName},</p>
              <p>Your session with ${client.firstName} ${client.lastName} has ended.</p>
              <p><strong>Date:</strong> ${new Date(appointment.dateTime).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${new Date(appointment.dateTime).toLocaleTimeString()} - ${new Date(appointment.endTime).toLocaleTimeString()}</p>
              <p>Please complete your session summary and add any necessary recommendations or follow-up recommendations.</p>
              <p>Thank you for your dedication to client care.</p>
            </div>
            `
        });
    } catch (error) {
        console.error('Error sending session completed notification:', error);
    }
};