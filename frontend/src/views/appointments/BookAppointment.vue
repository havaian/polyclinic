<template>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent">
            </div>
            <p class="mt-2 text-gray-600">Loading...</p>
        </div>

        <template v-else-if="doctor">
            <div class="bg-white shadow rounded-lg overflow-hidden">
                <div class="p-6">
                    <h1 class="text-2xl font-bold text-gray-900">
                        Book Appointment with Dr. {{ doctor.firstName }} {{ doctor.lastName }}
                    </h1>
                    <p class="mt-1 text-gray-600">{{ doctor.specialization }}</p>

                    <form @submit.prevent="handleSubmit" class="mt-6 space-y-6">
                        <!-- Date Selection -->
                        <div>
                            <label for="date" class="label">Select Date</label>
                            <input id="date" v-model="formData.date" type="date" :min="minDate" :max="maxDate"
                                class="input mt-1" required @change="fetchAvailableSlots" />
                        </div>

                        <!-- Time Slots -->
                        <div v-if="formData.date">
                            <label class="label">Available Time Slots</label>
                            <div class="mt-2 grid grid-cols-3 gap-3">
                                <button v-for="slot in availableSlots" :key="slot.start" type="button"
                                    class="btn-secondary"
                                    :class="{ 'ring-2 ring-indigo-500': formData.time === slot.start }"
                                    @click="formData.time = slot.start">
                                    {{ formatTime(slot.start) }}
                                </button>
                            </div>
                            <p v-if="availableSlots.length === 0" class="mt-2 text-sm text-gray-500">
                                No available slots for this date.
                            </p>
                        </div>

                        <!-- Consultation Type -->
                        <div>
                            <label class="label">Consultation Type</label>
                            <div class="mt-2 grid grid-cols-3 gap-3">
                                <button v-for="type in consultationTypes" :key="type.value" type="button"
                                    class="btn-secondary"
                                    :class="{ 'ring-2 ring-indigo-500': formData.type === type.value }"
                                    @click="formData.type = type.value">
                                    {{ type.label }}
                                </button>
                            </div>
                        </div>

                        <!-- Reason for Visit -->
                        <div>
                            <label for="reason" class="label">Reason for Visit</label>
                            <textarea id="reason" v-model="formData.reasonForVisit" rows="3" class="input mt-1"
                                required></textarea>
                        </div>

                        <!-- Fee Information -->
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="text-lg font-medium text-gray-900">Consultation Fee</h3>
                            <p class="mt-1 text-gray-600">
                                {{ formatCurrency(doctor.consultationFee.amount) }}
                                {{ doctor.consultationFee.currency }}
                            </p>
                            <p class="mt-2 text-sm text-gray-500">
                                Payment will be processed securely via Stripe after booking.
                            </p>
                        </div>

                        <div>
                            <button type="submit" class="btn-primary w-full" :disabled="!isFormValid || submitting">
                                {{ submitting ? 'Processing...' : 'Proceed to Payment' }}
                            </button>
                        </div>

                        <div v-if="error" class="text-sm text-center text-red-600">
                            {{ error }}
                        </div>
                    </form>
                </div>
            </div>
        </template>

        <div v-else class="text-center py-8">
            <p class="text-gray-600">Doctor not found.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format, addDays, parseISO } from 'date-fns'
import { usePaymentStore } from '@/stores/payment'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()

const doctor = ref(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const availableSlots = ref([])

const consultationTypes = [
    { value: 'video', label: 'Video' },
    { value: 'voice', label: 'Voice' },
    { value: 'chat', label: 'Chat' }
]

const formData = reactive({
    date: '',
    time: '',
    type: 'video',
    reasonForVisit: ''
})

const minDate = computed(() => format(new Date(), 'yyyy-MM-dd'))
const maxDate = computed(() => format(addDays(new Date(), 30), 'yyyy-MM-dd'))

const isFormValid = computed(() => {
    return formData.date && formData.time && formData.type && formData.reasonForVisit
})

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount)
}

const formatTime = (time) => {
    return format(parseISO(time), 'h:mm a')
}

async function fetchDoctorProfile() {
    try {
        loading.value = true
        const response = await axios.get(`/api/users/doctors/${route.params.doctorId}`)
        doctor.value = response.data.doctor
    } catch (error) {
        console.error('Error fetching doctor profile:', error)
    } finally {
        loading.value = false
    }
}

async function fetchAvailableSlots() {
    try {
        const response = await axios.get(`/api/appointments/availability/${route.params.doctorId}`, {
            params: { date: formData.date }
        })
        availableSlots.value = response.data.availableSlots
        formData.time = '' // Reset selected time when date changes
    } catch (error) {
        console.error('Error fetching available slots:', error)
        availableSlots.value = []
    }
}

async function handleSubmit() {
    try {
        submitting.value = true
        error.value = ''

        // Create appointment (patientId will be automatically set from auth token in backend)
        const appointmentData = {
            doctorId: route.params.doctorId,
            dateTime: formData.time,
            type: formData.type,
            reasonForVisit: formData.reasonForVisit
        }

        const response = await axios.post('/api/appointments', appointmentData)

        // Create checkout session and redirect to payment
        await paymentStore.createCheckoutSession(response.data.appointment._id)
    } catch (err) {
        console.error('Error booking appointment:', err)
        error.value = err.response?.data?.message || 'Failed to book appointment'
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    fetchDoctorProfile()
})
</script>