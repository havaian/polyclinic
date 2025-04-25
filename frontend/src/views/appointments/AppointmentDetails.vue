<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
      <p class="mt-2 text-gray-600">Loading appointment details...</p>
    </div>

    <template v-else-if="appointment">
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900">
              Appointment Details
            </h1>
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              :class="{
                'bg-green-100 text-green-800': appointment.status === 'completed',
                'bg-yellow-100 text-yellow-800': appointment.status === 'scheduled',
                'bg-red-100 text-red-800': appointment.status === 'canceled' || appointment.status === 'no-show'
              }"
            >
              {{ appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) }}
            </span>
          </div>
        </div>

        <!-- Appointment Info -->
        <div class="p-6 space-y-6">
          <!-- Participants -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Doctor</h3>
              <div class="flex items-center space-x-4">
                <img
                  :src="appointment.doctor.profilePicture || 'https://via.placeholder.com/100'"
                  :alt="appointment.doctor.firstName"
                  class="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p class="font-medium text-gray-900">
                    Dr. {{ appointment.doctor.firstName }} {{ appointment.doctor.lastName }}
                  </p>
                  <p class="text-sm text-gray-500">{{ appointment.doctor.specialization }}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Patient</h3>
              <div class="flex items-center space-x-4">
                <img
                  :src="appointment.patient.profilePicture || 'https://via.placeholder.com/100'"
                  :alt="appointment.patient.firstName"
                  class="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p class="font-medium text-gray-900">
                    {{ appointment.patient.firstName }} {{ appointment.patient.lastName }}
                  </p>
                  <p class="text-sm text-gray-500">
                    Age: {{ calculateAge(appointment.patient.dateOfBirth) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Appointment Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Date & Time</h3>
              <p class="text-gray-900">{{ formatDateTime(appointment.dateTime) }}</p>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Consultation Type</h3>
              <p class="text-gray-900">
                {{ appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1) }}
              </p>
            </div>
          </div>

          <!-- Reason for Visit -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Reason for Visit</h3>
            <p class="text-gray-900">{{ appointment.reasonForVisit }}</p>
          </div>

          <!-- Consultation Summary (if completed) -->
          <template v-if="appointment.status === 'completed'">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Consultation Summary</h3>
              <p class="text-gray-900">{{ appointment.consultationSummary || 'No summary provided.' }}</p>
            </div>

            <!-- Prescriptions -->
            <div v-if="appointment.prescriptions?.length">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Prescriptions</h3>
              <div class="space-y-4">
                <div
                  v-for="(prescription, index) in appointment.prescriptions"
                  :key="index"
                  class="bg-gray-50 p-4 rounded-lg"
                >
                  <p class="font-medium text-gray-900">{{ prescription.medication }}</p>
                  <p class="text-gray-600">Dosage: {{ prescription.dosage }}</p>
                  <p class="text-gray-600">Frequency: {{ prescription.frequency }}</p>
                  <p class="text-gray-600">Duration: {{ prescription.duration }}</p>
                  <p v-if="prescription.instructions" class="text-gray-600 mt-2">
                    Instructions: {{ prescription.instructions }}
                  </p>
                </div>
              </div>
            </div>
          </template>

          <!-- Actions -->
          <div class="flex justify-end space-x-4">
            <button
              v-if="appointment.status === 'scheduled' && authStore.isPatient"
              class="btn-secondary text-red-600 hover:text-red-700"
              @click="cancelAppointment"
            >
              Cancel Appointment
            </button>
            <button
              v-if="appointment.status === 'scheduled' && isWithinJoinWindow(appointment.dateTime)"
              class="btn-primary"
              @click="joinConsultation"
            >
              {{ authStore.isDoctor ? 'Start Consultation' : 'Join Consultation' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-8">
      <p class="text-gray-600">Appointment not found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { format, parseISO, differenceInYears, isWithinInterval, subMinutes, addMinutes } from 'date-fns'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const appointment = ref(null)
const loading = ref(true)

const formatDateTime = (dateTime) => {
  return format(parseISO(dateTime), 'MMM d, yyyy h:mm a')
}

const calculateAge = (dateOfBirth) => {
  return differenceInYears(new Date(), parseISO(dateOfBirth))
}

const isWithinJoinWindow = (dateTime) => {
  const appointmentTime = parseISO(dateTime)
  const now = new Date()
  return isWithinInterval(now, {
    start: subMinutes(appointmentTime, 5),
    end: addMinutes(appointmentTime, 30)
  })
}

async function fetchAppointment() {
  try {
    loading.value = true
    const response = await axios.get(`/api/appointments/${route.params.id}`)
    appointment.value = response.data.appointment
  } catch (error) {
    console.error('Error fetching appointment:', error)
  } finally {
    loading.value = false
  }
}

async function cancelAppointment() {
  if (!confirm('Are you sure you want to cancel this appointment?')) return

  try {
    await axios.patch(`/api/appointments/${appointment.value._id}/status`, {
      status: 'canceled'
    })
    await fetchAppointment()
  } catch (error) {
    console.error('Error canceling appointment:', error)
  }
}

async function joinConsultation() {
  try {
    const response = await axios.get(`/api/consultations/${appointment.value._id}/join`)
    if (response.data.consultation) {
      router.push({
        name: 'consultation-room',
        params: { appointmentId: appointment.value._id }
      })
    }
  } catch (error) {
    console.error('Error joining consultation:', error)
  }
}

onMounted(() => {
  fetchAppointment()
})
</script>