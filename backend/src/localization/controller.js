// backend/src/localization/controller.js
const Localization = require('./model');

exports.getLanguages = async (req, res) => {
    try {
        const languages = [
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'ru', name: 'Russian', nativeName: 'Русский' },
            { code: 'uz-latn', name: 'Uzbek Latin', nativeName: 'Oʻzbek' },
            { code: 'uz-cyrl', name: 'Uzbek Cyrillic', nativeName: 'Ўзбек' }
        ];

        res.json({ languages });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching languages' });
    }
};

exports.getTranslations = async (req, res) => {
    try {
        const { locale } = req.params;

        if (!['en', 'ru', 'uz-latn', 'uz-cyrl'].includes(locale)) {
            return res.status(400).json({ message: 'Invalid locale' });
        }

        const localization = await Localization.findOne({ language: locale });

        if (!localization) {
            return res.status(404).json({ message: 'Translations not found' });
        }

        res.json({
            locale,
            translations: localization.translations,
            version: localization.version
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching translations' });
    }
};

exports.getVersion = async (req, res) => {
    try {
        const { locale } = req.params;

        if (!['en', 'ru', 'uz-latn', 'uz-cyrl'].includes(locale)) {
            return res.status(400).json({ message: 'Invalid locale' });
        }

        const localization = await Localization.findOne({ language: locale });

        if (!localization) {
            return res.status(404).json({ message: 'Translations not found' });
        }

        res.json({
            locale,
            version: localization.version
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching version' });
    }
};

exports.updateTranslations = async (req, res) => {
    try {
        const { locale } = req.params;
        const { translations } = req.body;

        if (!['en', 'ru', 'uz-latn', 'uz-cyrl'].includes(locale)) {
            return res.status(400).json({ message: 'Invalid locale' });
        }

        const localization = await Localization.findOneAndUpdate(
            { language: locale },
            {
                translations,
                $inc: { version: 1 }
            },
            { new: true, upsert: true }
        );

        res.json(localization);
    } catch (error) {
        res.status(500).json({ message: 'Error updating translations' });
    }
};