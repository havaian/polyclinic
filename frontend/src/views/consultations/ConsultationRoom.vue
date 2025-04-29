<template>
    <div class="min-h-screen bg-gray-100">
        <!-- Header -->
        <header class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <h1 class="text-xl font-bold text-gray-900">
                            Consultation with {{ isDoctor ? consultation?.patient?.name : 'Dr. ' +
                            consultation?.doctor?.name }}
                        </h1>
                        <span class="ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="{
                            'bg-green-100 text-green-800': isConnected,
                            'bg-red-100 text-red-800': !isConnected
                        }">
                            {{ isConnected ? 'Connected' : 'Connecting...' }}
                        </span>
                    </div>
                    <button class="btn-secondary text-red-600 hover:text-red-700" @click="endConsultation">
                        End Consultation
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
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isConnected = ref(false)
const consultation = ref(null)
const api = ref(null)

const isDoctor = computed(() => authStore.isDoctor)

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
        if (!consultation.value?.jitsi) {
            throw new Error('Jitsi configuration not available')
        }

        await loadJitsiScript()

        // Wait for the JitsiMeetExternalAPI to be available
        if (!window.JitsiMeetExternalAPI) {
            throw new Error('Jitsi Meet External API not loaded')
        }

        const { domain, roomName, token } = consultation.value.jitsi

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
                displayName: authStore.isDoctor ?
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
            if (isDoctor.value) {
                endConsultation()
            } else {
                router.push({ name: 'appointment-details', params: { id: route.params.appointmentId } })
            }
        })
    } catch (error) {
        console.error('Error initializing Jitsi:', error)
        isConnected.value = false
    }
}

async function endConsultation() {
    try {
        if (isDoctor.value) {
            await axios.post(`/api/consultations/${route.params.appointmentId}/end`)
        }

        // Dispose Jitsi API
        if (api.value) {
            api.value.dispose()
        }

        router.push({ name: 'appointment-details', params: { id: route.params.appointmentId } })
    } catch (error) {
        console.error('Error ending consultation:', error)
    }
}

onMounted(async () => {
    try {
        // Get consultation details
        const response = await axios.get(`/api/consultations/${route.params.appointmentId}/join`)
        consultation.value = response.data.consultation

        await initializeJitsi()
    } catch (error) {
        console.error('Error joining consultation:', error)
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