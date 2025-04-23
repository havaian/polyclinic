<template>
  <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-fashion p-6">
    <h2 class="text-2xl font-display text-neutral-900 dark:text-white mb-6">
      Запись на прием
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Doctor Selection -->
      <div>
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Выберите врача
        </label>
        <div class="relative">
          <select
            v-model="form.doctorId"
            class="block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md dark:bg-neutral-700 dark:text-white"
            :class="{ 'border-red-500': errors.doctorId }"
          >
            <option value="">Выберите врача</option>
            <option
              v-for="doctor in doctors"
              :key="doctor.id"
              :value="doctor.id"
            >
              {{ doctor.name }} - {{ doctor.specialization }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <chevron-down-icon class="h-5 w-5 text-neutral-400" />
          </div>
        </div>
        <p v-if="errors.doctorId" class="mt-1 text-sm text-red-600">
          {{ errors.doctorId }}
        </p>
      </div>

      <!-- Date Selection -->
      <div>
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Выберите дату
        </label>
        <div class="relative">
          <input
            type="date"
            v-model="form.date"
            class="block w-full pl-3 pr-10 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md dark:bg-neutral-700 dark:text-white"
            :class="{ 'border-red-500': errors.date }"
            :min="minDate"
          />
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <calendar-icon class="h-5 w-5 text-neutral-400" />
          </div>
        </div>
        <p v-if="errors.date" class="mt-1 text-sm text-red-600">
          {{ errors.date }}
        </p>
      </div>

      <!-- Time Selection -->
      <div>
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Выберите время
        </label>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="time in availableTimes"
            :key="time"
            type="button"
            @click="form.time = time"
            class="py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200"
            :class="[
              form.time === time
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            ]"
          >
            {{ time }}
          </button>
        </div>
        <p v-if="errors.time" class="mt-1 text-sm text-red-600">
          {{ errors.time }}
        </p>
      </div>

      <!-- Symptoms -->
      <div>
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Опишите симптомы
        </label>
        <textarea
          v-model="form.symptoms"
          rows="4"
          class="block w-full px-3 py-2 text-base border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md dark:bg-neutral-700 dark:text-white"
          :class="{ 'border-red-500': errors.symptoms }"
          placeholder="Опишите ваши симптомы..."
        ></textarea>
        <p v-if="errors.symptoms" class="mt-1 text-sm text-red-600">
          {{ errors.symptoms }}
        </p>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          :disabled="isSubmitting"
        >
          <spinner-icon
            v-if="isSubmitting"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          />
          {{ isSubmitting ? 'Отправка...' : 'Записаться' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ChevronDownIcon,
  CalendarIcon,
  SpinnerIcon,
} from '@heroicons/vue/outline'

const props = defineProps({
  doctors: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['submit'])

const form = ref({
  doctorId: '',
  date: '',
  time: '',
  symptoms: '',
})

const errors = ref({
  doctorId: '',
  date: '',
  time: '',
  symptoms: '',
})

const isSubmitting = ref(false)

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const availableTimes = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
]

const validateForm = () => {
  let isValid = true
  errors.value = {
    doctorId: '',
    date: '',
    time: '',
    symptoms: '',
  }

  if (!form.value.doctorId) {
    errors.value.doctorId = 'Пожалуйста, выберите врача'
    isValid = false
  }

  if (!form.value.date) {
    errors.value.date = 'Пожалуйста, выберите дату'
    isValid = false
  }

  if (!form.value.time) {
    errors.value.time = 'Пожалуйста, выберите время'
    isValid = false
  }

  if (!form.value.symptoms) {
    errors.value.symptoms = 'Пожалуйста, опишите симптомы'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    await emit('submit', form.value)
    // Reset form after successful submission
    form.value = {
      doctorId: '',
      date: '',
      time: '',
      symptoms: '',
    }
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script> 