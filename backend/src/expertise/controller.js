const Specialization = require('./model');
const User = require('../user/model');

/**
 * Get all active expertise
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getActiveExpertise = async (req, res) => {
    try {
        const expertise = await Specialization.find({ isActive: true })
            .sort({ name: 1 })
            .select('name description icon');

        // Get count of active providers for each expertise
        const expertiseWithProviderCount = await Promise.all(
            expertise.map(async (spec) => {
                const providerCount = await User.countDocuments({
                    role: 'provider',
                    expertise: spec.name,
                    isActive: true,
                    isVerified: true
                });

                return {
                    ...spec.toObject(),
                    providerCount
                };
            })
        );

        res.status(200).json({
            expertise: expertiseWithProviderCount
        });
    } catch (error) {
        console.error('Error fetching expertise:', error);
        res.status(500).json({
            message: 'An error occurred while fetching expertise',
            error: error.message
        });
    }
};

/**
 * Get expertise by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSpecializationById = async (req, res) => {
    try {
        const { id } = req.params;

        const expertise = await Specialization.findById(id);

        if (!expertise) {
            return res.status(404).json({ message: 'Specialization not found' });
        }

        if (!expertise.isActive) {
            return res.status(404).json({ message: 'Specialization is not active' });
        }

        // Get count of active providers for this expertise
        const providerCount = await User.countDocuments({
            role: 'provider',
            expertise: expertise.name,
            isActive: true,
            isVerified: true
        });

        res.status(200).json({
            expertise: {
                ...expertise.toObject(),
                providerCount
            }
        });
    } catch (error) {
        console.error('Error fetching expertise:', error);
        res.status(500).json({
            message: 'An error occurred while fetching expertise',
            error: error.message
        });
    }
};

/**
 * Get providers by expertise
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProvidersBySpecialization = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const expertise = await Specialization.findById(id);

        if (!expertise) {
            return res.status(404).json({ message: 'Specialization not found' });
        }

        if (!expertise.isActive) {
            return res.status(404).json({ message: 'Specialization is not active' });
        }

        // Query for providers with this expertise
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const providers = await User.find({
            role: 'provider',
            expertise: expertise.name,
            isActive: true,
            isVerified: true
        })
            .select('firstName lastName profilePicture experience sessionFee bio languages address')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ experience: -1 });

        const total = await User.countDocuments({
            role: 'provider',
            expertise: expertise.name,
            isActive: true,
            isVerified: true
        });

        res.status(200).json({
            expertise: {
                _id: expertise._id,
                name: expertise.name,
                description: expertise.description,
                icon: expertise.icon
            },
            providers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching providers by expertise:', error);
        res.status(500).json({
            message: 'An error occurred while fetching providers',
            error: error.message
        });
    }
};