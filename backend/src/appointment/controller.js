const Appointment = require('./model.js');
const User = require('../user/model.js');
const { validateAppointmentInput } = require('../utils/validators');
const { NotificationService } = require('../notification');

// Create a new appointment
exports.createAppointment = async (req, res) => {
    try {
        const patientId = req.user.id;
        
        const { doctorId, dateTime, type, reasonForVisit, notes } = req.body;
        const appointmentData = {
            doctorId,
            dateTime,
            type,
            reasonForVisit,
            notes
        };
        
        const { error } = validateAppointmentInput(appointmentData);
        if (error) {
            // Send failure email to patient
            const patient = await User.findById(patientId);
            const doctor = await User.findById(doctorId);
            
            await emailService.sendAppointmentFailedEmail({
                patient,
                doctor,
                dateTime,
                type,
                error: error.details[0].message
            });
            
            return res.status(400).json({ message: error.details[0].message });
        }

        // Verify that doctor exists
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Verify that patient exists
        const patient = await User.findById(patientId);
        if (!patient || patient.role !== 'patient') {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Check if the doctor is available
        const appointmentDate = new Date(dateTime);
        const conflictingAppointment = await Appointment.findOne({
            doctor: doctorId,
            dateTime: {
                $gte: new Date(appointmentDate.getTime() - 30 * 60000),
                $lte: new Date(appointmentDate.getTime() + 30 * 60000)
            },
            status: 'scheduled'
        });

        if (conflictingAppointment) {
            // Send failure email to patient
            await emailService.sendAppointmentFailedEmail({
                patient,
                doctor,
                dateTime,
                type,
                error: 'Doctor is not available at this time'
            });
            
            return res.status(409).json({ message: 'Doctor is not available at this time' });
        }

        // Create new appointment
        const appointment = new Appointment({
            patient: patientId,
            doctor: doctorId,
            dateTime: appointmentDate,
            type,
            reasonForVisit,
            status: 'scheduled'
        });

        await appointment.save();

        // Send confirmation emails
        await emailService.sendAppointmentBookedEmails({
            ...appointment.toObject(),
            patient,
            doctor
        });

        res.status(201).json({
            message: 'Appointment created successfully',
            appointment
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'An error occurred while creating the appointment' });
    }
};

// Rest of the controller methods remain the same...
// Get all appointments for a patient
exports.getPatientAppointments = async (req, res) => {
    try {
        const { patientId } = req.params || req.user.id;
        const { status, limit = 10, skip = 0 } = req.query;

        const query = { patient: patientId };
        if (status) {
            query.status = status;
        }

        const appointments = await Appointment.find(query)
            .sort({ dateTime: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate('doctor', 'firstName lastName specializations profilePicture');

        const total = await Appointment.countDocuments(query);

        res.status(200).json({
            appointments,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip)
            }
        });
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({ message: 'An error occurred while fetching appointments' });
    }
};

// Get all appointments for a doctor
exports.getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { status, date, limit = 10, skip = 0 } = req.query;

        const query = { doctor: doctorId };
        if (status) {
            query.status = status;
        }

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            query.dateTime = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const appointments = await Appointment.find(query)
            .sort({ dateTime: 1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate('patient', 'firstName lastName profilePicture dateOfBirth');

        const total = await Appointment.countDocuments(query);

        res.status(200).json({
            appointments,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip)
            }
        });
    } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        res.status(500).json({ message: 'An error occurred while fetching appointments' });
    }
};

// Get a specific appointment by ID
exports.getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id)
            .populate('doctor', 'firstName lastName specializations profilePicture email phone')
            .populate('patient', 'firstName lastName profilePicture dateOfBirth email phone');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.status(200).json({ appointment });
    } catch (error) {
        console.error('Error fetching appointment details:', error);
        res.status(500).json({ message: 'An error occurred while fetching appointment details' });
    }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, consultationSummary } = req.body;

        const appointment = await Appointment.findById(id)
            .populate('patient')
            .populate('doctor');
            
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Validate status transition
        const validTransitions = {
            'scheduled': ['completed', 'canceled', 'no-show'],
            'completed': [],
            'canceled': [],
            'no-show': []
        };

        if (!validTransitions[appointment.status].includes(status)) {
            return res.status(400).json({
                message: `Cannot change status from ${appointment.status} to ${status}`
            });
        }

        const oldStatus = appointment.status;
        appointment.status = status;

        if (status === 'completed' && consultationSummary) {
            appointment.consultationSummary = consultationSummary;
        }

        await appointment.save();

        // Send cancellation emails if appointment was canceled
        if (status === 'canceled' && oldStatus === 'scheduled') {
            const cancelledBy = req.user.role === 'doctor' ? 'doctor' : 'patient';
            await emailService.sendAppointmentCancelledEmails(appointment, cancelledBy);
        }

        res.status(200).json({
            message: 'Appointment status updated successfully',
            appointment
        });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ message: 'An error occurred while updating appointment status' });
    }
};

// Add/update prescriptions for an appointment
exports.updatePrescriptions = async (req, res) => {
    try {
        const { id } = req.params;
        const { prescriptions } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Only allow doctors to update prescriptions for completed appointments
        if (appointment.status !== 'completed') {
            return res.status(400).json({
                message: 'Prescriptions can only be added to completed appointments'
            });
        }

        appointment.prescriptions = prescriptions;
        await appointment.save();

        // Notify patient about new prescriptions
        await NotificationService.sendPrescriptionNotification(appointment);

        res.status(200).json({
            message: 'Prescriptions updated successfully',
            appointment
        });
    } catch (error) {
        console.error('Error updating prescriptions:', error);
        res.status(500).json({ message: 'An error occurred while updating prescriptions' });
    }
};

// Schedule a follow-up appointment
exports.scheduleFollowUp = async (req, res) => {
    try {
        const { id } = req.params;
        const { followUpDate } = req.body;

        const appointment = await Appointment.findById(id)
            .populate('doctor')
            .populate('patient');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Update follow-up information
        appointment.followUp = {
            recommended: true,
            date: new Date(followUpDate)
        };

        await appointment.save();

        // Create a new appointment for the follow-up
        const followUpAppointment = new Appointment({
            patient: appointment.patient._id,
            doctor: appointment.doctor._id,
            dateTime: new Date(followUpDate),
            type: appointment.type,
            reasonForVisit: `Follow-up to appointment on ${appointment.dateTime.toLocaleDateString()}`,
            status: 'scheduled'
        });

        await followUpAppointment.save();

        // Notify about follow-up
        await NotificationService.sendFollowUpNotification(followUpAppointment);

        res.status(200).json({
            message: 'Follow-up scheduled successfully',
            followUpAppointment
        });
    } catch (error) {
        console.error('Error scheduling follow-up:', error);
        res.status(500).json({ message: 'An error occurred while scheduling follow-up' });
    }
};

// Get doctor's availability slots
exports.getDoctorAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Date parameter is required' });
        }

        // Get doctor's working hours
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Parse date and get working hours for that day of week
        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.getDay(); // 0 is Sunday, 1 is Monday, etc.

        const workingHours = doctor.availability && doctor.availability[dayOfWeek];
        if (!workingHours || !workingHours.isAvailable) {
            return res.status(200).json({
                message: 'Doctor is not available on this day',
                availableSlots: []
            });
        }

        // Generate time slots based on working hours (30 min intervals)
        const startTime = new Date(date);
        const [startHour, startMinute] = workingHours.startTime.split(':');
        startTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

        const endTime = new Date(date);
        const [endHour, endMinute] = workingHours.endTime.split(':');
        endTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

        let currentSlot = new Date(startTime);
        const availableSlots = [];

        while (currentSlot < endTime) {
            const slotEnd = new Date(currentSlot);
            slotEnd.setMinutes(slotEnd.getMinutes() + 30);

            if (slotEnd <= endTime) {
                availableSlots.push({
                    start: new Date(currentSlot),
                    end: new Date(slotEnd)
                });
            }

            currentSlot.setMinutes(currentSlot.getMinutes() + 30);
        }

        // Remove slots that already have appointments
        const bookedAppointments = await Appointment.find({
            doctor: doctorId,
            dateTime: {
                $gte: startTime,
                $lt: endTime
            },
            status: 'scheduled'
        });

        const bookedSlots = bookedAppointments.map(appointment => {
            const apptTime = new Date(appointment.dateTime);
            return apptTime.getTime();
        });

        const freeSlots = availableSlots.filter(slot => {
            return !bookedSlots.includes(slot.start.getTime());
        });

        res.status(200).json({
            availableSlots: freeSlots,
            workingHours: {
                start: workingHours.startTime,
                end: workingHours.endTime
            }
        });
    } catch (error) {
        console.error('Error fetching doctor availability:', error);
        res.status(500).json({ message: 'An error occurred while fetching doctor availability' });
    }
};