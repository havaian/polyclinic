const cron = require('node-cron');
const Appointment = require('../appointment/model');
const { NotificationService } = require('../notification');

// Schedule job to run every 5 minutes to check and end sessions that have reached their end time
const scheduleSessionTerminator = () => {
    cron.schedule('*/5 * * * *', async () => {
        try {
            console.log('Running session auto-termination check...');

            const now = new Date();

            // Find active 'scheduled' appointments that have passed their end time
            const expiredSessions = await Appointment.find({
                status: 'scheduled',
                endTime: { $lt: now }
            }).populate('provider client');

            console.log(`Found ${expiredSessions.length} sessions to auto-terminate`);

            // Mark each as completed
            for (const appointment of expiredSessions) {
                // Update appointment status
                appointment.status = 'completed';

                // Add automatic summary if none exists
                if (!appointment.sessionSummary) {
                    appointment.sessionSummary = 'This session was automatically marked as completed when its scheduled time ended.';
                }

                await appointment.save();

                // Send notifications to both client and provider
                await NotificationService.sendSessionCompletedNotification(appointment);

                console.log(`Auto-completed session ${appointment._id} that ended at ${appointment.endTime}`);
            }

            console.log('Session auto-termination check completed');
        } catch (error) {
            console.error('Error in session auto-termination job:', error);
        }
    }, {
        timezone: 'Asia/Tashkent' // Adjust timezone as needed
    });
};

module.exports = scheduleSessionTerminator;