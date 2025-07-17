// frontend/src/store/localization.js
import localizationService from '../services/localizationService';

export default {
    namespaced: true,

    state: {
        currentLocale: 'en',
        translations: {},
        availableLanguages: [
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'ru', name: 'Russian', nativeName: 'Русский' },
            { code: 'uz-latn', name: 'Uzbek Latin', nativeName: 'Oʻzbek' },
            { code: 'uz-cyrl', name: 'Uzbek Cyrillic', nativeName: 'Ўзбек' }
        ],
        loading: false
    },

    mutations: {
        SET_LOCALE(state, locale) {
            state.currentLocale = locale;
        },

        SET_TRANSLATIONS(state, translations) {
            state.translations = translations;
        },

        SET_LOADING(state, loading) {
            state.loading = loading;
        }
    },

    actions: {
        async changeLocale({ commit }, locale) {
            commit('SET_LOADING', true);

            try {
                const translations = await localizationService.setLocale(locale);
                commit('SET_LOCALE', locale);
                commit('SET_TRANSLATIONS', translations);
            } catch (error) {
                console.error('Error changing locale:', error);
            } finally {
                commit('SET_LOADING', false);
            }
        },

        async loadTranslations({ commit, state }) {
            commit('SET_LOADING', true);

            try {
                const translations = await localizationService.getTranslations(state.currentLocale);
                commit('SET_TRANSLATIONS', translations);
            } catch (error) {
                console.error('Error loading translations:', error);
            } finally {
                commit('SET_LOADING', false);
            }
        }
    },

    getters: {
        t: (state) => (key, data = {}) => {
            return localizationService.t(key, data);
        },

        currentLanguage: (state) => {
            return state.availableLanguages.find(lang => lang.code === state.currentLocale);
        }
    }
};