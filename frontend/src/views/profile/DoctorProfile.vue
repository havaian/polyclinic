<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <!-- Profile Header -->
      <div class="p-6 sm:p-8 border-b border-gray-200">
        <div class="flex flex-col sm:flex-row items-center">
          <img :src="user?.profilePicture || 'https://via.placeholder.com/150'" :alt="user?.firstName"
            class="h-32 w-32 rounded-full object-cover" />
          <div class="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left flex-1">
            <h1 class="text-2xl font-bold text-gray-900">
              Dr. {{ user?.firstName }} {{ user?.lastName }}
            </h1>
            <p class="text-gray-600">{{ user?.specialization }}</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {{ user?.experience }} years experience
              </span>
              <span v-for="lang in user?.languages" :key="lang"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {{ lang }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div class="p-6 sm:p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Professional Information -->
          <div>
            <h2 class="text-lg font-medium text-gray-900 mb-4">Professional Information</h2>
            <dl class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-gray-900">{{ user?.email }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Phone</dt>
                <dd class="mt-1 text-gray-900">{{ user?.phone }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">License Number</dt>
                <dd class="mt-1 text-gray-900">{{ user?.licenseNumber }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Consultation Fee</dt>
                <dd class="mt-1 text-gray-900">
                  {{ formatCurrency(user?.consultationFee?.amount) }}
                  {{ user?.consultationFee?.currency }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Education & Experience -->
          <div>
            <h2 class="text-lg font-medium text-gray-900 mb-4">Education</h2>
            <dl class="space-y-4">
              <div v-for="edu in user?.education" :key="edu.degree">
                <dt class="text-sm font-medium text-gray-900">{{ edu.degree }}</dt>
                <dd class="mt-1 text-gray-500">{{ edu.institution }} ({{ edu.year }})</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Bio -->
        <div class="mt-8">
          <h2 class="text-lg font-medium text-gray-900 mb-4">About</h2>
          <p class="text-gray-600">{{ user?.bio || 'No bio provided.' }}</p>
        </div>

        <!-- Availability -->
        <div class="mt-8">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Availability</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="day in availableDays" :key="day.dayOfWeek" class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-900">{{ formatDay(day.dayOfWeek) }}</h3>
              <p class="text-gray-600">{{ day.startTime }} - {{ day.endTime }}</p>
            </div>
          </div>
        </div>

        <!-- Edit Profile Button -->
        <div class="mt-8 flex justify-end">
          <router-link :to="{ name: 'profile-edit' }" class="btn-primary">
            Edit Profile
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const user = ref(null)

const availableDays = computed(() => {
  if (!user.value?.availability) return []
  return user.value.availability.filter(day => day.isAvailable)
})

const formatDay = (dayOfWeek) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek]
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('uz-UZ').format(amount)
}

async function fetchUserProfile() {
  try {
    const response = await axios.get('/api/users/me')
    user.value = response.data.user
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>