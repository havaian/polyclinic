<template>
  <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-fashion">
    <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
      <h2 class="text-2xl font-display text-neutral-900 dark:text-white">
        Профиль
      </h2>
    </div>

    <div class="p-6">
      <div class="flex items-start space-x-6">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div class="relative">
            <img
              :src="user.avatar || 'https://ui-avatars.com/api/?name=' + user.name + '&background=2563EB&color=fff'"
              :alt="user.name"
              class="h-24 w-24 rounded-full object-cover"
            />
            <button
              @click="changeAvatar"
              class="absolute bottom-0 right-0 p-1 bg-white dark:bg-neutral-700 rounded-full shadow-lg hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors duration-200"
            >
              <camera-icon class="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
            </button>
          </div>
        </div>

        <!-- User Info -->
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-medium text-neutral-900 dark:text-white">
              {{ user.name }}
            </h3>
            <button
              @click="isEditing = !isEditing"
              class="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <pencil-icon v-if="!isEditing" class="h-5 w-5" />
              <x-icon v-else class="h-5 w-5" />
            </button>
          </div>

          <form v-if="isEditing" @submit.prevent="handleSubmit" class="mt-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Имя
              </label>
              <input
                v-model="form.name"
                type="text"
                class="mt-1 block w-full rounded-md border-neutral-300 dark:border-neutral-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email
              </label>
              <input
                v-model="form.email"
                type="email"
                class="mt-1 block w-full rounded-md border-neutral-300 dark:border-neutral-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Телефон
              </label>
              <input
                v-model="form.phone"
                type="tel"
                class="mt-1 block w-full rounded-md border-neutral-300 dark:border-neutral-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white sm:text-sm"
              />
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Сохранить
              </button>
            </div>
          </form>

          <div v-else class="mt-4 space-y-4">
            <div class="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
              <mail-icon class="h-4 w-4 mr-2 text-primary-500" />
              <span>{{ user.email }}</span>
            </div>
            <div class="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
              <phone-icon class="h-4 w-4 mr-2 text-primary-500" />
              <span>{{ user.phone }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div class="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-4">
          <h4 class="text-sm font-medium text-neutral-900 dark:text-white mb-2">
            Статистика
          </h4>
          <dl class="grid grid-cols-2 gap-4">
            <div>
              <dt class="text-sm text-neutral-500 dark:text-neutral-400">
                Всего приемов
              </dt>
              <dd class="mt-1 text-2xl font-semibold text-neutral-900 dark:text-white">
                {{ stats.totalAppointments }}
              </dd>
            </div>
            <div>
              <dt class="text-sm text-neutral-500 dark:text-neutral-400">
                Активные приемы
              </dt>
              <dd class="mt-1 text-2xl font-semibold text-primary-500">
                {{ stats.activeAppointments }}
              </dd>
            </div>
          </dl>
        </div>

        <div class="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-4">
          <h4 class="text-sm font-medium text-neutral-900 dark:text-white mb-2">
            Последний прием
          </h4>
          <div v-if="stats.lastAppointment" class="space-y-2">
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              {{ stats.lastAppointment.doctorName }}
            </p>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              {{ formatDate(stats.lastAppointment.date) }}
            </p>
          </div>
          <p v-else class="text-sm text-neutral-500 dark:text-neutral-400">
            Нет данных
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  CameraIcon,
  PencilIcon,
  XIcon,
  MailIcon,
  PhoneIcon,
} from '@heroicons/vue/outline'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  stats: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update', 'changeAvatar'])

const isEditing = ref(false)
const form = ref({
  name: props.user.name,
  email: props.user.email,
  phone: props.user.phone,
})

const formatDate = (date) => {
  return dayjs(date).format('D MMMM YYYY')
}

const handleSubmit = async () => {
  try {
    await emit('update', form.value)
    isEditing.value = false
  } catch (error) {
    console.error('Error updating profile:', error)
  }
}

const changeAvatar = () => {
  emit('changeAvatar')
}
</script> 