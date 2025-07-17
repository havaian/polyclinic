<!-- frontend/src/components/LanguageSwitcher.vue -->
<template>
    <div class="relative">
        <button @click="toggleDropdown"
            class="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors">
            <span class="text-lg">{{ currentLanguage.flag }}</span>
            <span class="hidden sm:inline">{{ currentLanguage.nativeName }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        </button>

        <div v-if="isOpen"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <button v-for="language in availableLanguages" :key="language.code" @click="changeLanguage(language.code)"
                class="flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                :class="{ 'bg-blue-50 text-blue-600': language.code === currentLocale }">
                <span class="text-lg">{{ language.flag }}</span>
                <span class="font-medium">{{ language.nativeName }}</span>
            </button>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
    name: 'LanguageSwitcher',

    data() {
        return {
            isOpen: false,
            languageFlags: {
                'en': '🇺🇸',
                'ru': '🇷🇺',
                'uz-latn': '🇺🇿',
                'uz-cyrl': '🇺🇿'
            }
        };
    },

    computed: {
        ...mapState('localization', ['currentLocale', 'loading']),
        ...mapGetters('localization', ['currentLanguage']),

        availableLanguages() {
            return this.$store.state.localization.availableLanguages.map(lang => ({
                ...lang,
                flag: this.languageFlags[lang.code] || '🌐'
            }));
        },

        currentLanguage() {
            const lang = this.availableLanguages.find(l => l.code === this.currentLocale);
            return lang || this.availableLanguages[0];
        }
    },

    methods: {
        ...mapActions('localization', ['changeLocale']),

        toggleDropdown() {
            this.isOpen = !this.isOpen;
        },

        async changeLanguage(locale) {
            if (locale !== this.currentLocale && !this.loading) {
                await this.changeLocale(locale);

                // Update user preference if logged in
                if (this.$store.state.auth.user) {
                    try {
                        await this.$store.dispatch('auth/updateProfile', {
                            preferredLanguage: locale
                        });
                    } catch (error) {
                        console.error('Failed to update user language preference:', error);
                    }
                }
            }

            this.isOpen = false;
        }
    },

    mounted() {
        // Close dropdown when clicking outside
        const handleClickOutside = (e) => {
            if (!this.$el.contains(e.target)) {
                this.isOpen = false;
            }
        };

        document.addEventListener('click', handleClickOutside);

        // Cleanup on unmount
        this.$once('hook:beforeDestroy', () => {
            document.removeEventListener('click', handleClickOutside);
        });
    }
};
</script>