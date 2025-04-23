<template>
  <div class="group relative bg-white dark:bg-neutral-800 rounded-lg shadow-fashion hover:shadow-fashion-lg transition-all duration-300 overflow-hidden">
    <!-- Doctor Image -->
    <div class="aspect-w-3 aspect-h-4 relative">
      <img
        :src="doctor.image || 'https://ui-avatars.com/api/?name=Doctor&background=2563EB&color=fff'"
        :alt="doctor.name"
        class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="text-lg font-display text-neutral-900 dark:text-white mb-1">
        {{ doctor.name }}
      </h3>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
        {{ doctor.specialization }}
      </p>
      
      <!-- Rating -->
      <div class="flex items-center mb-3">
        <div class="flex items-center">
          <star-icon
            v-for="i in 5"
            :key="i"
            class="h-4 w-4"
            :class="i <= doctor.rating ? 'text-accent-500' : 'text-neutral-300 dark:text-neutral-600'"
          />
        </div>
        <span class="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
          ({{ doctor.reviews }} отзывов)
        </span>
      </div>

      <!-- Info -->
      <div class="space-y-2 mb-4">
        <div class="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
          <clock-icon class="h-4 w-4 mr-2 text-primary-500" />
          <span>Стаж: {{ doctor.experience }} лет</span>
        </div>
        <div class="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
          <academic-cap-icon class="h-4 w-4 mr-2 text-primary-500" />
          <span>{{ doctor.education }}</span>
        </div>
      </div>

      <!-- Action Button -->
      <button
        @click="$emit('book', doctor)"
        class="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Записаться
      </button>
    </div>

    <!-- Hover Info -->
    <div class="absolute inset-0 bg-white dark:bg-neutral-800 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div class="h-full flex flex-col">
        <h4 class="text-lg font-display text-neutral-900 dark:text-white mb-2">
          О враче
        </h4>
        <p class="text-sm text-neutral-600 dark:text-neutral-300 mb-4 flex-grow">
          {{ doctor.description }}
        </p>
        <div class="space-y-2">
          <div class="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
            <phone-icon class="h-4 w-4 mr-2 text-primary-500" />
            <span>{{ doctor.phone }}</span>
          </div>
          <div class="flex items-center text-sm text-neutral-600 dark:text-neutral-300">
            <mail-icon class="h-4 w-4 mr-2 text-primary-500" />
            <span>{{ doctor.email }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  StarIcon,
  ClockIcon,
  AcademicCapIcon,
  PhoneIcon,
  MailIcon,
} from '@heroicons/vue/outline'

defineProps({
  doctor: {
    type: Object,
    required: true,
  },
})

defineEmits(['book'])
</script> 