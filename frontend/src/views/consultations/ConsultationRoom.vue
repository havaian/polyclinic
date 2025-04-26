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
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Video Area -->
                <div class="lg:col-span-2 space-y-4">
                    <!-- Remote Video -->
                    <div class="bg-black rounded-lg aspect-video overflow-hidden">
                        <video ref="remoteVideo" class="w-full h-full object-cover" autoplay playsinline></video>
                    </div>

                    <!-- Local Video -->
                    <div class="absolute bottom-4 right-4 w-48 bg-black rounded-lg overflow-hidden">
                        <video ref="localVideo" class="w-full object-cover" autoplay playsinline muted></video>
                    </div>

                    <!-- Controls -->
                    <div class="flex justify-center space-x-4">
                        <button class="p-3 rounded-full"
                            :class="isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'"
                            @click="toggleAudio">
                            <span v-if="isMuted" class="sr-only">Unmute</span>
                            <span v-else class="sr-only">Mute</span>
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path v-if="isMuted" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        </button>

                        <button class="p-3 rounded-full"
                            :class="isVideoOff ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'"
                            @click="toggleVideo">
                            <span v-if="isVideoOff" class="sr-only">Turn on camera</span>
                            <span v-else class="sr-only">Turn off camera</span>
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path v-if="isVideoOff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Chat Area -->
                <div class="bg-white rounded-lg shadow overflow-hidden flex flex-col h-[600px]">
                    <div class="p-4 border-b border-gray-200">
                        <h2 class="text-lg font-medium text-gray-900">Chat</h2>
                    </div>

                    <!-- Messages -->
                    <div class="flex-1 p-4 overflow-y-auto" ref="chatMessages">
                        <div v-for="message in messages" :key="message.id" class="mb-4"
                            :class="message.sender === 'me' ? 'text-right' : 'text-left'">
                            <div class="inline-block rounded-lg px-4 py-2 max-w-xs"
                                :class="message.sender === 'me' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'">
                                {{ message.text }}
                            </div>
                            <div class="mt-1 text-xs text-gray-500">
                                {{ formatTime(message.timestamp) }}
                            </div>
                        </div>
                    </div>

                    <!-- Message Input -->
                    <div class="p-4 border-t border-gray-200">
                        <form @submit.prevent="sendMessage" class="flex space-x-2">
                            <input v-model="newMessage" type="text" class="input flex-1"
                                placeholder="Type a message..." />
                            <button type="submit" class="btn-primary">
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { format } from 'date-fns'
import { io } from 'socket.io-client'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const localVideo = ref(null)
const remoteVideo = ref(null)
const chatMessages = ref(null)

const isConnected = ref(false)
const isMuted = ref(false)
const isVideoOff = ref(false)
const consultation = ref(null)
const messages = ref([])
const newMessage = ref('')

const socket = ref(null)
const peerConnection = ref(null)
const localStream = ref(null)

const isDoctor = computed(() => authStore.isDoctor)

async function initializeWebRTC() {
    try {
        // Get user media
        localStream.value = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })

        // Display local video
        if (localVideo.value) {
            localVideo.value.srcObject = localStream.value
        }

        // Initialize WebRTC peer connection
        peerConnection.value = new RTCPeerConnection({
            iceServers: consultation.value.turnCredentials.iceServers
        })

        // Add local stream
        localStream.value.getTracks().forEach(track => {
            peerConnection.value.addTrack(track, localStream.value)
        })

        // Handle incoming stream
        peerConnection.value.ontrack = (event) => {
            if (remoteVideo.value) {
                remoteVideo.value.srcObject = event.streams[0]
            }
        }

        // Connect to signaling server
        socket.value = io(import.meta.env.VITE_API_URL, {
            path: '/socket.io'
        })

        // Register with room
        socket.value.emit('register', {
            userId: authStore.user.id,
            userType: authStore.user.role,
            appointmentId: route.params.appointmentId
        })

        // Handle connection status
        socket.value.on('connect', () => {
            isConnected.value = true
        })

        socket.value.on('disconnect', () => {
            isConnected.value = false
        })

        // Handle signaling
        socket.value.on('signal', handleSignal)

        // Handle chat messages
        socket.value.on('chat-message', handleChatMessage)
    } catch (error) {
        console.error('Error initializing WebRTC:', error)
    }
}

async function handleSignal(data) {
    try {
        if (data.signal.type === 'offer') {
            await peerConnection.value.setRemoteDescription(new RTCSessionDescription(data.signal))
            const answer = await peerConnection.value.createAnswer()
            await peerConnection.value.setLocalDescription(answer)
            socket.value.emit('signal', {
                appointmentId: route.params.appointmentId,
                signal: answer,
                targetUserId: data.userId
            })
        } else if (data.signal.type === 'answer') {
            await peerConnection.value.setRemoteDescription(new RTCSessionDescription(data.signal))
        } else if (data.signal.candidate) {
            await peerConnection.value.addIceCandidate(new RTCIceCandidate(data.signal))
        }
    } catch (error) {
        console.error('Error handling signal:', error)
    }
}

function handleChatMessage(data) {
    messages.value.push({
        id: Date.now(),
        text: data.message,
        sender: data.userId === authStore.user.id ? 'me' : 'other',
        timestamp: new Date(data.timestamp)
    })

    // Scroll to bottom
    nextTick(() => {
        if (chatMessages.value) {
            chatMessages.value.scrollTop = chatMessages.value.scrollHeight
        }
    })
}

function sendMessage() {
    if (!newMessage.value.trim()) return

    socket.value.emit('chat-message', {
        appointmentId: route.params.appointmentId,
        message: newMessage.value
    })

    newMessage.value = ''
}

function toggleAudio() {
    if (localStream.value) {
        const audioTrack = localStream.value.getAudioTracks()[0]
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled
            isMuted.value = !audioTrack.enabled
        }
    }
}

function toggleVideo() {
    if (localStream.value) {
        const videoTrack = localStream.value.getVideoTracks()[0]
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled
            isVideoOff.value = !videoTrack.enabled
        }
    }
}

async function endConsultation() {
    try {
        if (isDoctor.value) {
            await axios.post(`/api/consultations/${route.params.appointmentId}/end`)
        }

        // Clean up
        if (localStream.value) {
            localStream.value.getTracks().forEach(track => track.stop())
        }
        if (socket.value) {
            socket.value.disconnect()
        }
        if (peerConnection.value) {
            peerConnection.value.close()
        }

        router.push({ name: 'appointment-details', params: { id: route.params.appointmentId } })
    } catch (error) {
        console.error('Error ending consultation:', error)
    }
}

const formatTime = (date) => {
    return format(new Date(date), 'h:mm a')
}

onMounted(async () => {
    try {
        // Get consultation details
        const response = await axios.get(`/api/consultations/${route.params.appointmentId}/join`)
        consultation.value = response.data.consultation

        await initializeWebRTC()
    } catch (error) {
        console.error('Error joining consultation:', error)
        router.push({ name: 'appointment-details', params: { id: route.params.appointmentId } })
    }
})

onUnmounted(() => {
    // Clean up
    if (localStream.value) {
        localStream.value.getTracks().forEach(track => track.stop())
    }
    if (socket.value) {
        socket.value.disconnect()
    }
    if (peerConnection.value) {
        peerConnection.value.close()
    }
})
</script>