<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="role" class="label">I am a</label>
            <select
              id="role"
              v-model="formData.role"
              class="input mt-1"
              required
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="label">First Name</label>
              <input
                id="firstName"
                v-model="formData.firstName"
                type="text"
                required
                class="input mt-1"
              />
            </div>
            <div>
              <label for="lastName" class="label">Last Name</label>
              <input
                id="lastName"
                v-model="formData.lastName"
                type="text"
                required
                class="input mt-1"
              />
            </div>
          </div>

          <div>
            <label for="email" class="label">Email address</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              class="input mt-1"
            />
          </div>

          <div>
            <label for="phone" class="label">Phone number</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              required
              class="input mt-1"
              placeholder="+998901234567"
            />
          </div>

          <div>
            <label for="password" class="label">Password</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              class="input mt-1"
            />
          </div>

          <template v-if="formData.role === 'patient'">
            <div>
              <label for="dateOfBirth" class="label">Date of Birth</label>
              <input
                id="dateOfBirth"
                v-model="formData.dateOfBirth"
                type="date"
                required
                class="input mt-1"
              />
            </div>

            <div>
              <label for="gender" class="label">Gender</label>
              <select
                id="gender"
                v-model="formData.gender"
                class="input mt-1"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </template>

          <template v-if="formData.role === 'doctor'">
            <div>
              <label for="specialization" class="label">Specialization</label>
              <select
                id="specialization"
                v-model="formData.specialization"
                class="input mt-1"
                required
              >
                <option v-for="spec in specializations" :key="spec" :value="spec">
                  {{ spec }}
                </option>
              </select>
            </div>

            <div>
              <label for="licenseNumber" class="label">License Number</label>
              <input
                id="licenseNumber"
                v-model="formData.licenseNumber"
                type="text"
                required
                class="input mt-1"
              />
            </div>

            <div>
              <label for="experience" class="label">Years of Experience</label>
              <input
                id="experience"
                v-model.number="formData.experience"
                type="number"
                min="0"
                required
                class="input mt-1"
              />
            </div>

            <div>
              <label for="consultationFee" class="label">Consultation Fee (UZS)</label>
              <input
                id="consultationFee"
                v-model.number="formData.consultationFee"
                type="number"
                min="0"
                required
                class="input mt-1"
              />
            </div>
          </template>
        </div>

        <div>
          <button type="submit" class="btn-primary w-full" :disabled="loading">
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>
      </form>

      <p class="mt-2 text-center text-sm text-gray-600">
        Already have an account?
        <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </router-link>
      </p>

      <div v-if="error" class="mt-4 text-sm text-center text-red-600">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const specializations = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'Neurology',
  'Obstetrics & Gynecology',
  'Ophthalmology',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Urology'
]

const formData = reactive({
  role: 'patient',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  dateOfBirth: '',
  gender: '',
  specialization: '',
  licenseNumber: '',
  experience: 0,
  consultationFee: 0
})

const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  try {
    loading.value = true
    error.value = ''

    const userData = { ...formData }
    if (userData.role === 'doctor') {
      delete userData.dateOfBirth
      delete userData.gender
    } else {
      delete userData.specialization
      delete userData.licenseNumber
      delete userData.experience
      delete userData.consultationFee
    }

    await authStore.register(userData)
    router.push('/login')
  } catch (err) {
    error.value = err.message || 'Failed to create account'
  } finally {
    loading.value = false
  }
}
</script>