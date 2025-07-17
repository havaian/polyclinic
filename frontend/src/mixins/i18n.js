// frontend/src/mixins/i18n.js
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters('localization', ['t'])
    },

    methods: {
        $t(key, data = {}) {
            return this.t(key, data);
        },

        // Helper method for pluralization
        $tc(key, count, data = {}) {
            const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
            const fallbackKey = count === 1 ? key : `${key}s`;

            let translation = this.t(pluralKey, { ...data, count });
            if (translation === pluralKey) {
                translation = this.t(fallbackKey, { ...data, count });
            }
            if (translation === fallbackKey) {
                translation = this.t(key, { ...data, count });
            }

            return translation;
        }
    }
};