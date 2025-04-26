<template>
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full text-center">
            <div class="rounded-full bg-green-100 h-24 w-24 flex items-center justify-center mx-auto">
                <svg class="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
                Payment Successful!
            </h2>
            <p class="mt-2 text-sm text-gray-600">
                Your appointment has been confirmed and payment has been processed.
            </p>

            <div class="mt-8 space-y-4">
                <router-link :to="{ name: 'appointment-details', params: { id: appointmentId } }"
                    class="btn-primary w-full justify-center">
                    View Appointment Details
                </router-link>

                <router-link :to="{ name: 'patient-appointments' }" class="btn-secondary w-full justify-center">
                    View All Appointments
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePaymentStore } from '@/stores/payment'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()

const appointmentId = ref(null)
const loading = ref(true)

onMounted(async () => {
    try {
        const sessionId = route.query.session_id
        if (!sessionId) {
            router.push('/')
            return
        }

        const result = await paymentStore.verifyPayment(sessionId)
        if (result.success) {
            appointmentId.value = result.payment.appointment
        } else {
            router.push('/')
        }
    } catch (error) {
        console.error('Error verifying payment:', error)
        router.push('/')
    } finally {
        loading.value = false
    }
})
</script>