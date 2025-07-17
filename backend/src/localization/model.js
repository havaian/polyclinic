// backend/src/localization/model.js
const mongoose = require('mongoose');

const localizationSchema = new mongoose.Schema({
    language: {
        type: String,
        required: true,
        unique: true,
        enum: ['en', 'ru', 'uz-latn', 'uz-cyrl']
    },
    translations: {
        type: Object,
        required: true
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Localization', localizationSchema);