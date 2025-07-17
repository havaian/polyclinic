// frontend/src/services/localizationService.js
class LocalizationService {
    constructor() {
        this.cache = this.loadCache();
        this.currentLocale = this.cache.current_locale || 'en';
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    }

    loadCache() {
        try {
            const cached = localStorage.getItem('localization_cache');
            return cached ? JSON.parse(cached) : { current_locale: 'en' };
        } catch (error) {
            return { current_locale: 'en' };
        }
    }

    saveCache() {
        try {
            localStorage.setItem('localization_cache', JSON.stringify(this.cache));
        } catch (error) {
            console.error('Error saving localization cache:', error);
        }
    }

    async getTranslations(locale) {
        const now = Date.now();
        const cached = this.cache[locale];

        // Check if cached and not expired
        if (cached && cached.expiresAt && new Date(cached.expiresAt) > now) {
            return cached.data;
        }

        try {
            // Check version first to see if we need to refetch
            if (cached && cached.version) {
                const versionResponse = await fetch(`/api/localization/${locale}/version`);
                const versionData = await versionResponse.json();

                if (cached.version === versionData.version) {
                    // Update expiry and return cached data
                    this.cache[locale].expiresAt = new Date(now + this.cacheExpiry).toISOString();
                    this.saveCache();
                    return cached.data;
                }
            }

            // Fetch complete translations file
            const response = await fetch(`/api/localization/${locale}`);
            const data = await response.json();

            // Cache the entire translations object
            this.cache[locale] = {
                data: data.translations,
                version: data.version,
                fetchedAt: new Date(now).toISOString(),
                expiresAt: new Date(now + this.cacheExpiry).toISOString()
            };

            this.saveCache();
            return data.translations;
        } catch (error) {
            console.error('Error fetching translations:', error);
            return cached?.data || {};
        }
    }

    async setLocale(locale) {
        this.currentLocale = locale;
        this.cache.current_locale = locale;
        this.saveCache();

        const translations = await this.getTranslations(locale);
        return translations;
    }

    getCurrentLocale() {
        return this.currentLocale;
    }

    t(key, data = {}) {
        const translations = this.cache[this.currentLocale]?.data || {};
        let value = this.getNestedValue(translations, key);

        if (!value) {
            // Fallback to English if key not found
            const enTranslations = this.cache['en']?.data || {};
            value = this.getNestedValue(enTranslations, key) || key;
        }

        // Simple variable replacement
        return value.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
            return data[variable] || match;
        });
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    // Method to get all translations for current locale (useful for debugging)
    getAllTranslations() {
        return this.cache[this.currentLocale]?.data || {};
    }
}

export default new LocalizationService();