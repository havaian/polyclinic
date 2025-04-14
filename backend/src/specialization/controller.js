const Specialization = require('./model');
const User = require('../user/model');

/**
 * Get all active specializations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getActiveSpecializations = async (req, res) => {
    try {
        const specializations = await Specialization.find({ isActive: true })
            .sort({ name: 1 })
            .select('name description icon');

        // Get count of active doctors for each specialization
        const specializationsWithDoctorCount = await Promise.all(
            specializations.map(async (spec) => {
                const doctorCount = await User.countDocuments({
                    role: 'doctor',
                    specialization: spec.name,
                    isActive: true,
                    isVerified: true
                });

                return {
                    ...spec.toObject(),
                    doctorCount
                };
            })
        );

        res.status(200).json({
            specializations: specializationsWithDoctorCount
        });
    } catch (error) {
        console.error('Error fetching specializations:', error);
        res.status(500).json({
            message: 'An error occurred while fetching specializations',
            error: error.message
        });
    }
};

/**
 * Get specialization by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSpecializationById = async (req, res) => {
    try {
        const { id } = req.params;

        const specialization = await Specialization.findById(id);

        if (!specialization) {
            return res.status(404).json({ message: 'Specialization not found' });
        }

        if (!specialization.isActive) {
            return res.status(404).json({ message: 'Specialization is not active' });
        }

        // Get count of active doctors for this specialization
        const doctorCount = await User.countDocuments({
            role: 'doctor',
            specialization: specialization.name,
            isActive: true,
            isVerified: true
        });

        res.status(200).json({
            specialization: {
                ...specialization.toObject(),
                doctorCount
            }
        });
    } catch (error) {
        console.error('Error fetching specialization:', error);
        res.status(500).json({
            message: 'An error occurred while fetching specialization',
            error: error.message
        });
    }
};

/**
 * Get doctors by specialization
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDoctorsBySpecialization = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const specialization = await Specialization.findById(id);

        if (!specialization) {
            return res.status(404).json({ message: 'Specialization not found' });
        }

        if (!specialization.isActive) {
            return res.status(404).json({ message: 'Specialization is not active' });
        }

        // Query for doctors with this specialization
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const doctors = await User.find({
            role: 'doctor',
            specialization: specialization.name,
            isActive: true,
            isVerified: true
        })
            .select('firstName lastName profilePicture experience consultationFee bio languages address')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ experience: -1 });

        const total = await User.countDocuments({
            role: 'doctor',
            specialization: specialization.name,
            isActive: true,
            isVerified: true
        });

        res.status(200).json({
            specialization: {
                _id: specialization._id,
                name: specialization.name,
                description: specialization.description,
                icon: specialization.icon
            },
            doctors,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching doctors by specialization:', error);
        res.status(500).json({
            message: 'An error occurred while fetching doctors',
            error: error.message
        });
    }
};