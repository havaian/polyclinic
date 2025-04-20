<template>
  <v-app-bar app color="primary" dark>
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    
    <v-toolbar-title>BISP</v-toolbar-title>
    
    <v-spacer></v-spacer>
    
    <v-btn icon @click="toggleNotifications">
      <v-badge :content="unreadNotifications" :value="unreadNotifications">
        <v-icon>mdi-bell</v-icon>
      </v-badge>
    </v-btn>
    
    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-avatar size="32">
            <v-img :src="userAvatar" alt="User avatar"></v-img>
          </v-avatar>
        </v-btn>
      </template>
      
      <v-list>
        <v-list-item to="/profile">
          <v-list-item-title>Профиль</v-list-item-title>
          <v-list-item-icon>
            <v-icon>mdi-account</v-icon>
          </v-list-item-icon>
        </v-list-item>
        
        <v-list-item to="/appointments">
          <v-list-item-title>Мои записи</v-list-item-title>
          <v-list-item-icon>
            <v-icon>mdi-calendar</v-icon>
          </v-list-item-icon>
        </v-list-item>
        
        <v-list-item @click="logout">
          <v-list-item-title>Выйти</v-list-item-title>
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
  
  <v-navigation-drawer v-model="drawer" app>
    <v-list>
      <v-list-item to="/" exact>
        <v-list-item-title>Главная</v-list-item-title>
        <v-list-item-icon>
          <v-icon>mdi-home</v-icon>
        </v-list-item-icon>
      </v-list-item>
      
      <v-list-item to="/doctors">
        <v-list-item-title>Найти врача</v-list-item-title>
        <v-list-item-icon>
          <v-icon>mdi-doctor</v-icon>
        </v-list-item-icon>
      </v-list-item>
      
      <v-list-item to="/chat">
        <v-list-item-title>Чат</v-list-item-title>
        <v-list-item-icon>
          <v-icon>mdi-chat</v-icon>
        </v-list-item-icon>
      </v-list-item>
      
      <v-list-item to="/documents">
        <v-list-item-title>Документы</v-list-item-title>
        <v-list-item-icon>
          <v-icon>mdi-file-document</v-icon>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'AppHeader',
  setup() {
    const store = useStore()
    const router = useRouter()
    const drawer = ref(false)
    
    const userAvatar = computed(() => store.state.auth.user?.avatar || '/default-avatar.png')
    const unreadNotifications = computed(() => store.state.notifications.unreadCount)
    
    const toggleNotifications = () => {
      // Реализация уведомлений
    }
    
    const logout = async () => {
      await store.dispatch('auth/logout')
      router.push('/auth')
    }
    
    return {
      drawer,
      userAvatar,
      unreadNotifications,
      toggleNotifications,
      logout
    }
  }
}
</script> 