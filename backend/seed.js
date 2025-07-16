// backend/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./src/user/model');
const Specialization = require('./src/expertise/model');

// Set longer timeout for MongoDB operations
mongoose.set('bufferTimeoutMS', 30000);

// MongoDB connection with options to avoid buffering issues
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ [db seed] Connected to MongoDB');
    } catch (err) {
        console.error('❌ [db seed] MongoDB connection error:', err);
        process.exit(1);
    }
};

// Seed data
const expertise = [
    { name: 'Cardiology', description: 'Heart and cardiovascular system specialists', icon: 'fa-heart' },
    { name: 'Pediatrics', description: 'Child healthcare specialists', icon: 'fa-child' },
    { name: 'Dermatology', description: 'Skin, hair, and nail specialists', icon: 'fa-hand-holding-medical' },
    { name: 'Neurology', description: 'Nervous system specialists', icon: 'fa-brain' },
    { name: 'Orthopedics', description: 'Musculoskeletal system specialists', icon: 'fa-bone' },
    { name: 'Gynecology', description: 'Women\'s health specialists', icon: 'fa-female' },
    { name: 'Psychiatry', description: 'Mental health specialists', icon: 'fa-head-side-virus' },
    { name: 'Ophthalmology', description: 'Eye care specialists', icon: 'fa-eye' },
    { name: 'General Medicine', description: 'General practitioners and family medicine', icon: 'fa-user-md' },
    { name: 'Endocrinology', description: 'Hormone and metabolic disorder specialists', icon: 'fa-dna' }
];

// Seed function with better error handling
async function seedDatabase() {
    try {
        console.log('🔄 [db seed] Connecting to database...');
        await connectDB();
        
        console.log('🧹 [db seed] Cleaning existing data...');
        
        // Clear existing data with timeout handling
        await Promise.all([
            User.deleteMany({}).maxTimeMS(30000),
            Specialization.deleteMany({}).maxTimeMS(30000)
        ]);
        
        console.log('🌱 [db seed] Seeding expertise...');
        
        // Create expertise
        const createdExpertise = await Specialization.insertMany(expertise);
        console.log(`✅ [db seed] Created ${createdExpertise.length} expertise`);
    } catch (error) {
        console.error('❌ [db seed] Seeding error:', error);
    } finally {
        // Always disconnect
        try {
            await mongoose.disconnect();
            console.log('🔌 [db seed] Disconnected from MongoDB');
        } catch (disconnectError) {
            console.error('[db seed] Error disconnecting:', disconnectError);
        }
        process.exit(0);
    }
}

// Run the seeder
seedDatabase();