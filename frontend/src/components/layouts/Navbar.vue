<template>
  <nav class="bg-white dark:bg-neutral-900 shadow-fashion">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-2xl font-display text-primary-600 dark:text-primary-400">
              BISP
            </router-link>
          </div>
          
          <!-- Navigation Links -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.href"
              :class="[
                $route.path === item.href
                  ? 'border-primary-500 text-neutral-900 dark:text-white'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-300',
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200'
              ]"
            >
              {{ item.name }}
            </router-link>
          </div>
        </div>

        <!-- Right side -->
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <sun-icon v-if="isDark" class="h-5 w-5" />
            <moon-icon v-else class="h-5 w-5" />
          </button>

          <!-- Profile dropdown -->
          <div class="ml-3 relative">
            <div>
              <button
                @click="isProfileOpen = !isProfileOpen"
                class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <img
                  class="h-8 w-8 rounded-full object-cover"
                  :src="userAvatar"
                  alt="User avatar"
                />
              </button>
            </div>

            <!-- Dropdown menu -->
            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="isProfileOpen"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-fashion-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5"
              >
                <div class="py-1">
                  <router-link
                    v-for="item in profileMenuItems"
                    :key="item.name"
                    :to="item.href"
                    class="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    {{ item.name }}
                  </router-link>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="flex items-center sm:hidden">
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="inline-flex items-center justify-center p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            <menu-icon v-if="!isMobileMenuOpen" class="h-6 w-6" />
            <x-icon v-else class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="isMobileMenuOpen" class="sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.href"
            :class="[
              $route.path === item.href
                ? 'bg-primary-50 dark:bg-primary-900 border-primary-500 text-primary-700 dark:text-primary-300'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300',
              'block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200'
            ]"
          >
            {{ item.name }}
          </router-link>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { SunIcon, MoonIcon, MenuIcon, XIcon } from '@heroicons/vue/outline'
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleTheme = useToggle(isDark)
const route = useRoute()

const isProfileOpen = ref(false)
const isMobileMenuOpen = ref(false)

const navigationItems = [
  { name: 'Главная', href: '/' },
  { name: 'Запись', href: '/appointments' },
  { name: 'Консультации', href: '/consultations' },
  { name: 'Профиль', href: '/profile' },
]

const profileMenuItems = [
  { name: 'Мой профиль', href: '/profile' },
  { name: 'Настройки', href: '/settings' },
  { name: 'Выйти', href: '/logout' },
]

const userAvatar = computed(() => {
  // Здесь должна быть логика получения аватара пользователя
  return 'https://ui-avatars.com/api/?name=User&background=2563EB&color=fff'
})
</script> 