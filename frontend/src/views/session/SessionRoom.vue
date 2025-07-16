<template>
    <div class="min-h-screen bg-gray-100">
        <!-- Header -->
        <header class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <h1 class="text-xl font-bold text-gray-900">
                            Session with {{ session?.client?.name ||
                                session?.provider?.name }}
                        </h1>
                        <span class="ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="{
                            'bg-green-100 text-green-800': isConnected,
                            'bg-red-100 text-red-800': !isConnected
                        }">
                            {{ isConnected ? 'Connected' : 'Connecting...' }}
                        </span>
                    </div>
                    <button class="btn-secondary text-red-600 hover:text-red-700" @click="showEndSessionConfirm">
                        End Session
                    </button>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="grid grid-cols-1 gap-8">
                <!-- Video Area -->
                <div class="bg-white shadow rounded-lg overflow-hidden">
                    <!-- Jitsi Meet container -->
                    <div id="jitsi-container" class="w-full h-[600px]"></div>
                </div>
            </div>
        </main>

        <!-- End Session Confirmation Modal -->
        <div v-if="showEndConfirmation"
            class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full mx-4">
                <div class="p-6">
                    <h3 class="text-lg font-medium text-gray-900">End Session</h3>
                    <p class="mt-2 text-sm text-gray-500">
                        Are you sure you want to end this session?
                        {{ isProvider ? 'You\'ll be asked to provide a summary and recommendations.' : '' }}
                    </p>
                    <div class="mt-4 flex justify-end space-x-3">
                        <button @click="showEndConfirmation = false" class="btn-secondary">
                            Cancel
                        </button>
                        <button @click="confirmEndSession" class="btn-primary bg-red-600 hover:bg-red-700">
                            End Session
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Post-Session Form for Providers -->
        <div v-if="showPostSessionForm && isProvider"
            class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg overflow-hidden shadow-xl max-w-4xl w-full mx-4 my-8">
                <div class="p-6 max-h-[90vh] overflow-y-auto">
                    <h3 class="text-xl font-bold text-gray-900 mb-4">Session Summary</h3>

                    <form @submit.prevent="submitPostSessionForm">
                        <!-- Session Summary -->
                        <div class="mb-6">
                            <label for="sessionSummary" class="block text-sm font-medium text-gray-700 mb-1">
                                Session Summary
                            </label>
                            <textarea id="sessionSummary" v-model="postSessionData.sessionSummary"
                                rows="4" class="input w-full" required></textarea>
                        </div>

                        <!-- Recommendations -->
                        <div class="mb-6">
                            <div class="flex justify-between items-center mb-2">
                                <h4 class="text-lg font-medium text-gray-900">Recommendations</h4>
                                <button type="button" @click="addPrescription"
                                    class="text-sm bg-gradient-to-r from-medical-blue to-medical-teal bg-clip-text text-transparent  hover:text-indigo-900">
                                    + Add Prescription
                                </button>
                            </div>

                            <div v-for="(prescription, index) in postSessionData.recommendations" :key="index"
                                class="bg-gray-50 p-4 rounded-lg mb-3">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div>
                                        <label :for="`medication-${index}`"
                                            class="block text-sm font-medium text-gray-700 mb-1">
                                            Medication
                                        </label>
                                        <input :id="`medication-${index}`" v-model="prescription.medication" type="text"
                                            class="input w-full" required />
                                    </div>
                                    <div>
                                        <label :for="`dosage-${index}`"
                                            class="block text-sm font-medium text-gray-700 mb-1">
                                            Dosage
                                        </label>
                                        <input :id="`dosage-${index}`" v-model="prescription.dosage" type="text"
                                            class="input w-full" required />
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <div>
                                        <label :for="`frequency-${index}`"
                                            class="block text-sm font-medium text-gray-700 mb-1">
                                            Frequency
                                        </label>
                                        <input :id="`frequency-${index}`" v-model="prescription.frequency" type="text"
                                            class="input w-full" required />
                                    </div>
                                    <div>
                                        <label :for="`duration-${index}`"
                                            class="block text-sm font-medium text-gray-700 mb-1">
                                            Duration
                                        </label>
                                        <input :id="`duration-${index}`" v-model="prescription.duration" type="text"
                                            class="input w-full" required />
                                    </div>
                                </div>
                                <div class="mb-2">
                                    <label :for="`instructions-${index}`"
                                        class="block text-sm font-medium text-gray-700 mb-1">
                                        Instructions
                                    </label>
                                    <textarea :id="`instructions-${index}`" v-model="prescription.instructions" rows="2"
                                        class="input w-full"></textarea>
                                </div>
                                <button type="button" @click="removePrescription(index)"
                                    class="text-sm text-red-600 hover:text-red-900">
                                    Remove
                                </button>
                            </div>

                            <div v-if="postSessionData.recommendations.length === 0"
                                class="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                                No recommendations added. Click "Add Prescription" to add one.
                            </div>
                        </div>

                        <!-- Follow-up Recommendation -->
                        <div class="mb-6">
                            <div class="flex items-center mb-2">
                                <input id="followUpRecommended" v-model="postSessionData.followUp.recommended"
                                    type="checkbox" class="h-4 w-4 bg-gradient-to-r from-medical-blue to-medical-teal bg-clip-text text-transparent  rounded" />
                                <label for="followUpRecommended" class="ml-2 block text-sm font-medium text-gray-700">
                                    Recommend Follow-up Appointment
                                </label>
                            </div>

                            <div v-if="postSessionData.followUp.recommended" class="ml-6 mt-3">
                                <label for="followUpDate" class="block text-sm font-medium text-gray-700 mb-1">
                                    Recommended Follow-up Date
                                </label>
                                <input id="followUpDate" v-model="postSessionData.followUp.date" type="date"
                                    class="input w-full" :min="minFollowUpDate" required />

                                <div class="mt-3">
                                    <label for="followUpNotes" class="block text-sm font-medium text-gray-700 mb-1">
                                        Follow-up Notes
                                    </label>
                                    <textarea id="followUpNotes" v-model="postSessionData.followUp.notes" rows="2"
                                        class="input w-full"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Chat Log (if available) -->
                        <div v-if="chatLog.length > 0" class="mb-6">
                            <h4 class="text-lg font-medium text-gray-900 mb-2">Chat Log</h4>
                            <div class="bg-gray-50 p-4 rounded-lg h-40 overflow-y-auto">
                                <div v-for="(message, index) in chatLog" :key="index" class="mb-2">
                                    <span class="font-semibold">{{ message.sender }}:</span> {{ message.text }}
                                    <span class="text-xs text-gray-500 ml-2">{{ message.time }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="mt-6 flex justify-end space-x-3">
                            <button type="button" @click="skipPostSession" class="btn-secondary">
                                Skip
                            </button>
                            <button type="submit" class="btn-primary" :disabled="submitting">
                                {{ submitting ? 'Saving...' : 'Save and End Session' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Follow-up Created Notification -->
        <div v-if="showFollowUpNotification"
            class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full mx-4">
                <div class="p-6">
                    <div class="flex items-center justify-center mb-4">
                        <div class="bg-green-100 rounded-full p-3">
                            <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 text-center">Follow-up Appointment Created</h3>
                    <p class="mt-2 text-sm text-gray-500 text-center">
                        A follow-up appointment has been created and is now pending payment.
                        The client will need to pay to confirm the appointment.
                    </p>
                    <div class="mt-4 flex justify-center">
                        <button @click="returnToAppointments" class="btn-primary">
                            Return to Appointments
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { format, addDays } from 'date-fns'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isConnected = ref(false)
const session = ref(null)
const api = ref(null)
const chatLog = ref([])
const submitting = ref(false)

// Modal states
const showEndConfirmation = ref(false)
const showPostSessionForm = ref(false)
const showFollowUpNotification = ref(false)

// Post-session form data
const postSessionData = reactive({
    sessionSummary: '',
    recommendations: [],
    followUp: {
        recommended: false,
        date: '',
        notes: ''
    }
})

const isProvider = computed(() => authStore.isProvider)

const minFollowUpDate = computed(() => {
    const tomorrow = addDays(new Date(), 1)
    return format(tomorrow, 'yyyy-MM-dd')
})

function loadJitsiScript() {
    return new Promise((resolve, reject) => {
        if (document.getElementById('jitsi-api-script')) {
            resolve()
            return
        }

        const script = document.createElement('script')
        script.id = 'jitsi-api-script'
        script.src = 'https://meet.jit.si/external_api.js'
        script.async = true
        script.onload = resolve
        script.onerror = reject
        document.body.appendChild(script)
    })
}

async function initializeJitsi() {
    try {
        if (!session.value?.jitsi) {
            throw new Error('Jitsi configuration not available')
        }

        await loadJitsiScript()

        // Wait for the JitsiMeetExternalAPI to be available
        if (!window.JitsiMeetExternalAPI) {
            throw new Error('Jitsi Meet External API not loaded')
        }

        const { domain, roomName, token } = session.value.jitsi

        // Configure Jitsi options
        const options = {
            roomName,
            jwt: token,
            width: '100%',
            height: '100%',
            parentNode: document.getElementById('jitsi-container'),
            configOverwrite: {
                prejoinPageEnabled: false,
                disableDeepLinking: true,
                startWithAudioMuted: false,
                startWithVideoMuted: false
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                DEFAULT_BACKGROUND: '#FFFFFF',
                DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'settings', 'raisehand', 'videoquality', 'filmstrip', 'feedback',
                    'stats', 'tileview'
                ]
            },
            userInfo: {
                displayName: authStore.isProvider ?
                    `Dr. ${authStore.user.firstName} ${authStore.user.lastName}` :
                    `${authStore.user.firstName} ${authStore.user.lastName}`
            }
        }

        // Create Jitsi Meet external API instance
        api.value = new window.JitsiMeetExternalAPI(domain, options)

        // Set event listeners
        api.value.on('videoConferenceJoined', () => {
            isConnected.value = true
        })

        api.value.on('videoConferenceLeft', () => {
            if (isProvider.value) {
                // If provider hasn't completed the form yet, show it
                if (!showPostSessionForm.value) {
                    showPostSessionForm.value = true
                }
            } else {
                router.push({ name: 'appointment-details', params: { id: route.params.appointmentId } })
            }
        })

        // Try to capture chat messages
        api.value.on('chatUpdated', (event) => {
            if (event && event.message) {
                chatLog.value.push({
                    sender: event.from || 'Unknown',
                    text: event.message,
                    time: format(new Date(), 'HH:mm')
                })
            }
        })
    } catch (error) {
        console.error('Error initializing Jitsi:', error)
        isConnected.value = false
    }
}

function showEndSessionConfirm() {
    showEndConfirmation.value = true
}

function confirmEndSession() {
    showEndConfirmation.value = false

    // Dispose Jitsi API 
    if (api.value) {
        // Try to get chat history if possible
        try {
            const messages = api.value.getChatHistory()
            if (messages && Array.isArray(messages)) {
                chatLog.value = messages.map(msg => ({
                    sender: msg.from || 'Unknown',
                    text: msg.message,
                    time: format(new Date(msg.timestamp || Date.now()), 'HH:mm')
                }))
            }
        } catch (e) {
            console.log('Chat history not available:', e)
        }

        api.value.dispose()
    }

    if (isProvider.value) {
        showPostSessionForm.value = true
    } else {
        router.push({ name: 'appointment-details', params: { id: route.params.appointmentId } })
    }
}

function addPrescription() {
    postSessionData.recommendations.push({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
    })
}

function removePrescription(index) {
    postSessionData.recommendations.splice(index, 1)
}

async function submitPostSessionForm() {
    try {
        submitting.value = true

        // 1. Update appointment status to completed and add session summary
        await axios.patch(`/api/appointments/${route.params.appointmentId}/status`, {
            status: 'completed',
            sessionSummary: postSessionData.sessionSummary
        })

        // 2. Add recommendations if any
        if (postSessionData.recommendations.length > 0) {
            await axios.patch(`/api/appointments/${route.params.appointmentId}/recommendations`, {
                recommendations: postSessionData.recommendations
            })
        }

        // 3. Schedule follow-up if recommended
        if (postSessionData.followUp.recommended) {
            await axios.post(`/api/appointments/${route.params.appointmentId}/follow-up`, {
                followUpDate: postSessionData.followUp.date,
                notes: postSessionData.followUp.notes
            })

            // Show follow-up notification
            showPostSessionForm.value = false
            showFollowUpNotification.value = true
        } else {
            returnToAppointments()
        }
    } catch (error) {
        console.error('Error submitting post-session data:', error)
        alert('An error occurred while saving the session data. Please try again.')
    } finally {
        submitting.value = false
    }
}

function skipPostSession() {
    // Just end the session without saving any data
    router.push({ name: 'provider-appointments' })
}

function returnToAppointments() {
    router.push(isProvider.value ?
        { name: 'provider-appointments' } :
        { name: 'client-appointments' }
    )
}

onMounted(async () => {
    try {
        // Get session details
        const response = await axios.get(`/api/sessions/${route.params.appointmentId}/join`)
        session.value = response.data.session

        await initializeJitsi()
    } catch (error) {
        console.error('Error joining session:', error)
        router.push({ name: 'appointment-details', params: { id: route.params.appointmentId } })
    }
})

onUnmounted(() => {
    // Clean up Jitsi
    if (api.value) {
        api.value.dispose()
    }
})
</script>