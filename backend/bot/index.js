const { Bot, session, GrammyError, HttpError } = require('grammy');
const axios = require('axios');

// Create bot instance
const bot = process.env.TELEGRAM_BOT_TOKEN
    ? new Bot(process.env.TELEGRAM_BOT_TOKEN)
    : null;

// Middleware
if (bot) {
    // Set up session middleware
    bot.use(session({
        initial: () => ({
            step: 'idle',
            userData: {},
            verificationCode: null,
            appointmentData: {}
        })
    }));

    // Error handling middleware
    bot.catch((err) => {
        const ctx = err.ctx;
        console.error(`Error while handling update ${ctx.update.update_id}:`);

        if (err instanceof GrammyError) {
            console.error("Error in request:", err.description);
        } else if (err instanceof HttpError) {
            console.error("Could not contact Telegram:", err);
        } else {
            console.error("Unknown error:", err);
        }
    });

    // Welcome message
    bot.command("start", async (ctx) => {
        await ctx.reply(
            "👋 Welcome to Doctor.uz bot!\n\n" +
            "I can help you manage your medical appointments and consultations.\n\n" +
            "Here's what you can do:\n" +
            "- Link your Doctor.uz account\n" +
            "- View your upcoming appointments\n" +
            "- Get reminders for consultations\n" +
            "- Chat with virtual medical assistant\n\n" +
            "To begin, please use the /link command to connect your Doctor.uz account."
        );
    });

    // Help command
    bot.command("help", async (ctx) => {
        await ctx.reply(
            "🙋‍♂️ Available commands:\n\n" +
            "/start - Start the bot\n" +
            "/link - Link your Doctor.uz account\n" +
            "/appointments - View your appointments\n" +
            "/profile - View your profile\n" +
            "/unlink - Unlink your account\n" +
            "/assistant - Chat with medical assistant\n\n" +
            "If you need further assistance, contact support@doctor.uz"
        );
    });

    // Link account command
    bot.command("link", async (ctx) => {
        ctx.session.step = 'link_email';

        await ctx.reply(
            "To link your Doctor.uz account, I'll need your email address.\n\n" +
            "Please enter the email you used to register on Doctor.uz:"
        );
    });

    // Handle email input for linking
    bot.on("message:text", async (ctx) => {
        if (ctx.session.step === 'link_email') {
            const email = ctx.message.text.trim();

            // Email validation
            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            if (!emailRegex.test(email)) {
                await ctx.reply("⚠️ Please enter a valid email address.");
                return;
            }

            try {
                // Request verification code from API
                const response = await axios.post(
                    `${process.env.API_URL}/users/telegram-verification`,
                    { email, telegramChatId: ctx.chat.id }
                );

                if (response.data.success) {
                    ctx.session.step = 'link_verification';
                    ctx.session.userData.email = email;

                    await ctx.reply(
                        "📧 We've sent a verification code to your email.\n\n" +
                        "Please enter the code you received to link your account:"
                    );
                }
            } catch (error) {
                console.error('Error requesting verification code:', error.response?.data || error.message);
                await ctx.reply(
                    "❌ Failed to send verification code. Please make sure your email is registered with Doctor.uz.\n\n" +
                    "Try again with /link or contact support if the problem persists."
                );
                ctx.session.step = 'idle';
            }
        } else if (ctx.session.step === 'link_verification') {
            const verificationCode = ctx.message.text.trim();

            try {
                // Verify the code with API
                const response = await axios.post(
                    `${process.env.API_URL}/users/link-telegram`,
                    {
                        telegramId: ctx.chat.id.toString(),
                        verificationCode
                    }
                );

                if (response.data.message === 'Telegram account linked successfully') {
                    await ctx.reply(
                        "🎉 Your Doctor.uz account has been successfully linked!\n\n" +
                        "You'll now receive notifications about your appointments and consultations.\n\n" +
                        "Use /appointments to view your upcoming appointments or /help to see all available commands."
                    );

                    ctx.session.step = 'idle';
                }
            } catch (error) {
                console.error('Error verifying code:', error.response?.data || error.message);
                await ctx.reply(
                    "❌ Invalid verification code. Please try again or request a new code with /link."
                );
            }
        } else if (ctx.session.step === 'appointment_reason') {
            // Save reason for visit
            ctx.session.appointmentData.reasonForVisit = ctx.message.text.trim();
            ctx.session.step = 'appointment_confirm';

            const { doctorName, date, time, type } = ctx.session.appointmentData;

            await ctx.reply(
                "📋 Please confirm your appointment details:\n\n" +
                `Doctor: ${doctorName}\n` +
                `Date: ${date}\n` +
                `Time: ${time}\n` +
                `Type: ${type}\n` +
                `Reason: ${ctx.session.appointmentData.reasonForVisit}\n\n` +
                "Is this correct? (Yes/No)"
            );
        } else if (ctx.session.step === 'appointment_confirm') {
            const answer = ctx.message.text.trim().toLowerCase();

            if (answer === 'yes' || answer === 'y') {
                try {
                    const { doctorId, dateTime, type, reasonForVisit } = ctx.session.appointmentData;

                    // Create appointment via API
                    const response = await axios.post(
                        `${process.env.API_URL}/appointments`,
                        {
                            doctorId,
                            dateTime,
                            type,
                            reasonForVisit
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${ctx.session.userData.token}`
                            }
                        }
                    );

                    if (response.data.appointment) {
                        await ctx.reply(
                            "✅ Your appointment has been scheduled successfully!\n\n" +
                            "You'll receive reminders before your appointment time."
                        );
                    }
                } catch (error) {
                    console.error('Error creating appointment:', error.response?.data || error.message);
                    await ctx.reply(
                        "❌ Failed to schedule appointment. Please try again later or book through the website."
                    );
                }

                ctx.session.step = 'idle';
                ctx.session.appointmentData = {};
            } else if (answer === 'no' || answer === 'n') {
                await ctx.reply(
                    "❌ Appointment booking canceled. You can start over with /appointment or visit our website."
                );

                ctx.session.step = 'idle';
                ctx.session.appointmentData = {};
            } else {
                await ctx.reply("Please answer with Yes or No.");
            }
        } else if (ctx.session.step === 'assistant_chat') {
            // Handle chat with AI assistant
            try {
                const userMessage = ctx.message.text.trim();

                // Call to virtual assistant API
                const response = await axios.post(
                    `${process.env.API_URL}/assistant/chat`,
                    {
                        message: userMessage,
                        userId: ctx.session.userData.userId
                    }
                );

                if (response.data.reply) {
                    await ctx.reply(response.data.reply, { parse_mode: 'Markdown' });
                }
            } catch (error) {
                console.error('Error with assistant:', error.response?.data || error.message);
                await ctx.reply(
                    "I'm having trouble processing your request. Please try again later."
                );
            }
        }
    });

    // View appointments command
    bot.command("appointments", async (ctx) => {
        if (!ctx.session.userData.userId) {
            await ctx.reply(
                "You need to link your Doctor.uz account first. Use /link to get started."
            );
            return;
        }

        try {
            // Fetch appointments from API
            const response = await axios.get(
                `${process.env.API_URL}/appointments/user`,
                {
                    headers: {
                        'Authorization': `Bearer ${ctx.session.userData.token}`
                    }
                }
            );

            const appointments = response.data.appointments;

            if (appointments.length === 0) {
                await ctx.reply("You don't have any upcoming appointments.");
                return;
            }

            let message = "📅 Your upcoming appointments:\n\n";

            appointments.forEach((appointment, index) => {
                const date = new Date(appointment.dateTime).toLocaleDateString();
                const time = new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                message += `${index + 1}. Doctor: ${appointment.doctor.firstName} ${appointment.doctor.lastName}\n`;
                message += `   Date: ${date} at ${time}\n`;
                message += `   Type: ${appointment.type}\n`;
                message += `   Status: ${appointment.status}\n\n`;
            });

            await ctx.reply(message);
        } catch (error) {
            console.error('Error fetching appointments:', error.response?.data || error.message);
            await ctx.reply(
                "Failed to retrieve your appointments. Please try again later."
            );
        }
    });

    // Book appointment command
    bot.command("appointment", async (ctx) => {
        if (!ctx.session.userData.userId) {
            await ctx.reply(
                "You need to link your Doctor.uz account first. Use /link to get started."
            );
            return;
        }

        try {
            // Fetch available specializations
            const response = await axios.get(
                `${process.env.API_URL}/doctors/specializations`
            );

            const specializations = response.data.specializations;

            ctx.session.step = 'appointment_specialization';
            ctx.session.appointmentData = {};

            let message = "Please select a medical specialization:\n\n";
            specializations.forEach((spec, index) => {
                message += `${index + 1}. ${spec}\n`;
            });

            await ctx.reply(message);
        } catch (error) {
            console.error('Error fetching specializations:', error.response?.data || error.message);
            await ctx.reply(
                "Failed to retrieve specializations. Please try booking through our website."
            );
        }
    });

    // Profile command
    bot.command("profile", async (ctx) => {
        if (!ctx.session.userData.userId) {
            await ctx.reply(
                "You need to link your Doctor.uz account first. Use /link to get started."
            );
            return;
        }

        try {
            // Fetch user profile from API
            const response = await axios.get(
                `${process.env.API_URL}/users/me`,
                {
                    headers: {
                        'Authorization': `Bearer ${ctx.session.userData.token}`
                    }
                }
            );

            const user = response.data.user;

            let message = "👤 Your Profile\n\n";
            message += `Name: ${user.firstName} ${user.lastName}\n`;
            message += `Email: ${user.email}\n`;
            message += `Phone: ${user.phone}\n`;

            if (user.role === 'patient') {
                message += `Gender: ${user.gender || 'Not specified'}\n`;
                if (user.dateOfBirth) {
                    const dob = new Date(user.dateOfBirth).toLocaleDateString();
                    message += `Date of Birth: ${dob}\n`;
                }
            } else if (user.role === 'doctor') {
                message += `Specialization: ${user.specialization}\n`;
                message += `Experience: ${user.experience} years\n`;
                message += `Consultation Fee: ${user.consultationFee.amount} ${user.consultationFee.currency}\n`;
            }

            message += "\nTo update your profile, please visit our website.";

            await ctx.reply(message);
        } catch (error) {
            console.error('Error fetching profile:', error.response?.data || error.message);
            await ctx.reply(
                "Failed to retrieve your profile. Please try again later."
            );
        }
    });

    // Unlink account command
    bot.command("unlink", async (ctx) => {
        if (!ctx.session.userData.userId) {
            await ctx.reply(
                "Your account is not linked. Use /link to connect your Doctor.uz account."
            );
            return;
        }

        ctx.session.step = 'unlink_confirm';

        await ctx.reply(
            "⚠️ Are you sure you want to unlink your Doctor.uz account? You will no longer receive notifications.\n\n" +
            "Please reply with 'Yes' to confirm or 'No' to cancel."
        );
    });

    // Chat with medical assistant command
    bot.command("assistant", async (ctx) => {
        ctx.session.step = 'assistant_chat';

        await ctx.reply(
            "👨‍⚕️ I'm the Doctor.uz virtual medical assistant. I can answer general medical questions and provide health information.\n\n" +
            "What would you like to know about? (Type /stop to end the chat)"
        );
    });

    // Stop assistant chat
    bot.command("stop", async (ctx) => {
        if (ctx.session.step === 'assistant_chat') {
            ctx.session.step = 'idle';
            await ctx.reply("Virtual assistant chat ended. How else can I help you? Use /help to see available commands.");
        }
    });

    // Start the bot
    if (process.env.NODE_ENV === 'production') {
        // Use webhook in production
        const webhookDomain = process.env.WEBHOOK_DOMAIN;
        const secretPath = `/telegram-webhook/${process.env.TELEGRAM_WEBHOOK_SECRET}`;

        bot.api.setWebhook(`${webhookDomain}${secretPath}`);
        console.log(`Telegram bot webhook set up at ${webhookDomain}${secretPath}`);
    } else {
        // Use long polling in development
        bot.start();
        console.log('Telegram bot started with long polling');
    }
}

// Export bot instance
module.exports = {
    telegramBot: bot,
    handleUpdate: (req, res) => {
        if (!bot) {
            return res.status(500).json({ error: 'Telegram bot not initialized' });
        }

        // Process update from webhook
        bot.handleUpdate(req.body);
        res.status(200).json({ status: 'ok' });
    }
};