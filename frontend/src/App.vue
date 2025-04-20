<template>
  <v-app>
    <app-header v-if="isAuthenticated" />
    
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
    
    <app-footer v-if="isAuthenticated" />
  </v-app>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter
  },
  setup() {
    const store = useStore()
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

    return {
      isAuthenticated
    }
  }
}
</script>

<style>
@import './assets/tailwind.css';
</style>
