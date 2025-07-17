// backend/seedTranslations.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Localization = require('./src/localization/model');

// Load your existing en.json file
const enTranslations = JSON.parse(fs.readFileSync(path.join(__dirname, 'locales', 'en.json'), 'utf8'));

// Create placeholder translations for other languages (you'll need to translate these)
const languages = [
    { code: 'en', translations: enTranslations },
    { code: 'ru', translations: enTranslations }, // Replace with actual Russian translations
    { code: 'uz-latn', translations: enTranslations }, // Replace with actual Uzbek Latin translations
    { code: 'uz-cyrl', translations: enTranslations } // Replace with actual Uzbek Cyrillic translations
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Clear existing translations
        await Localization.deleteMany({});

        // Insert new translations
        for (const lang of languages) {
            await Localization.create({
                language: lang.code,
                translations: lang.translations,
                version: 1
            });
            console.log(`Seeded ${lang.code} translations`);
        }

        console.log('All translations seeded successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error seeding translations:', error);
        process.exit(1);
    });