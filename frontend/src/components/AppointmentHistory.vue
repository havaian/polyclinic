<template>
  <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-fashion">
    <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
      <h2 class="text-2xl font-display text-neutral-900 dark:text-white">
        История приемов
      </h2>
    </div>

    <div class="divide-y divide-neutral-200 dark:divide-neutral-700">
      <div
        v-for="appointment in appointments"
        :key="appointment.id"
        class="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors duration-200"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center">
              <h3 class="text-lg font-medium text-neutral-900 dark:text-white">
                {{ appointment.doctorName }}
              </h3>
              <span
                class="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusClass(appointment.status)"
              >
                {{ getStatusText(appointment.status) }}
              </span>
            </div>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {{ appointment.specialization }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0">
            <button
              @click="showDetails(appointment)"
              class="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <chevron-right-icon class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-4">
          <div class="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
            <calendar-icon class="h-4 w-4 mr-2 text-primary-500" />
            <span>{{ formatDate(appointment.date) }}</span>
          </div>
          <div class="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
            <clock-icon class="h-4 w-4 mr-2 text-primary-500" />
            <span>{{ appointment.time }}</span>
          </div>
        </div>

        <div v-if="appointment.symptoms" class="mt-4">
          <h4 class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Симптомы:
          </h4>
          <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {{ appointment.symptoms }}
          </p>
        </div>

        <div v-if="appointment.diagnosis" class="mt-4">
          <h4 class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Диагноз:
          </h4>
          <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {{ appointment.diagnosis }}
          </p>
        </div>

        <div v-if="appointment.prescription" class="mt-4">
          <h4 class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Назначения:
          </h4>
          <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {{ appointment.prescription }}
          </p>
        </div>

        <div class="mt-4 flex items-center justify-between">
          <div class="flex items-center">
            <star-icon
              v-for="i in 5"
              :key="i"
              class="h-4 w-4"
              :class="i <= (appointment.rating || 0) ? 'text-accent-500' : 'text-neutral-300 dark:text-neutral-600'"
            />
          </div>
          <button
            v-if="!appointment.rating && appointment.status === 'completed'"
            @click="rateAppointment(appointment)"
            class="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Оставить отзыв
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="appointments.length === 0"
      class="p-6 text-center"
    >
      <calendar-icon class="mx-auto h-12 w-12 text-neutral-400" />
      <h3 class="mt-2 text-sm font-medium text-neutral-900 dark:text-white">
        Нет записей
      </h3>
      <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        У вас пока нет записей на прием.
      </p>
      <div class="mt-6">
        <router-link
          to="/appointments/new"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Записаться на прием
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/vue/outline'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')

const props = defineProps({
  appointments: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['showDetails', 'rate'])

const getStatusClass = (status) => {
  const classes = {
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return classes[status] || classes.scheduled
}

const getStatusText = (status) => {
  const texts = {
    scheduled: 'Запланирован',
    completed: 'Завершен',
    cancelled: 'Отменен',
  }
  return texts[status] || 'Запланирован'
}

const formatDate = (date) => {
  return dayjs(date).format('D MMMM YYYY')
}

const showDetails = (appointment) => {
  emit('showDetails', appointment)
}

const rateAppointment = (appointment) => {
  emit('rate', appointment)
}
</script> 