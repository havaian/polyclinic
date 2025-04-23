<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Навигация -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <!-- Логотип -->
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/" class="text-xl font-bold text-blue-600">
                E-Polyclinic
              </router-link>
            </div>

            <!-- Навигационные ссылки -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-blue-500 text-gray-900"
              >
                Главная
              </router-link>
              <router-link
                to="/appointments"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-blue-500 text-gray-900"
              >
                Запись на приём
              </router-link>
              <router-link
                to="/consultations"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                active-class="border-blue-500 text-gray-900"
              >
                Консультации
              </router-link>
            </div>
          </div>

          <!-- Правая часть навигации -->
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <template v-if="isAuthenticated">
              <!-- Профиль -->
              <div class="ml-3 relative">
                <div>
                  <button
                    type="button"
                    class="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    @click="isProfileMenuOpen = !isProfileMenuOpen"
                  >
                    <span class="sr-only">Открыть меню профиля</span>
                    <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-blue-600 font-medium">
                        {{ userInitials }}
                      </span>
                    </div>
                  </button>
                </div>

                <!-- Выпадающее меню профиля -->
                <div
                  v-if="isProfileMenuOpen"
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <router-link
                    to="/profile"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Профиль
                  </router-link>
                  <button
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="handleLogout"
                  >
                    Выйти
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <router-link
                to="/login"
                class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Войти
              </router-link>
              <router-link
                to="/register"
                class="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Регистрация
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Основной контент -->
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'MainLayout',
  setup() {
    const store = useStore()
    const router = useRouter()
    const isProfileMenuOpen = ref(false)

    const isAuthenticated = computed(() => store.getters.isAuthenticated)
    const user = computed(() => store.getters.currentUser)

    const userInitials = computed(() => {
      if (!user.value?.name) return ''
      return user.value.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    })

    const handleLogout = async () => {
      try {
        await store.dispatch('logout')
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    return {
      isAuthenticated,
      user,
      userInitials,
      isProfileMenuOpen,
      handleLogout
    }
  }
}
</script> 