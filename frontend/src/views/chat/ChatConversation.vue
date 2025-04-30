<template>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white shadow rounded-lg overflow-hidden h-[600px]">
            <chat-window :messages="messages" :recipient-name="recipientName" :recipient-avatar="recipientAvatar"
                :recipient-status="recipientStatus" :user-initials="userInitials" :is-typing="isTyping"
                :disabled="loading" :loading="sending" @submit="sendMessage" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ChatWindow from '@/components/chat/ChatWindow.vue'
import axios from 'axios'
import io from 'socket.io-client'

const route = useRoute()
const authStore = useAuthStore()

const messages = ref([])
const conversation = ref(null)
const loading = ref(true)
const sending = ref(false)
const isTyping = ref(false)
const socket = ref(null)

const userInitials = computed(() => {
    const user = authStore.user
    if (!user) return 'U'
    return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase()
})

const recipient = computed(() => {
    if (!conversation.value) return null
    return conversation.value.participants.find(p => p._id !== authStore.user._id)
})

const recipientName = computed(() => {
    if (!recipient.value) return ''
    return recipient.value.role === 'doctor' ?
        `Dr. ${recipient.value.firstName} ${recipient.value.lastName}` :
        `${recipient.value.firstName} ${recipient.value.lastName}`
})

const recipientAvatar = computed(() => {
    return recipient.value?.profilePicture || '/images/user-placeholder.jpg'
})

const recipientStatus = computed(() => {
    if (!recipient.value?.isOnline) return 'Offline'
    return 'Online'
})

async function fetchConversation() {
    try {
        loading.value = true
        const response = await axios.get(`/api/chat/conversations/${route.params.id}`)
        conversation.value = response.data.conversation
        messages.value = response.data.messages
    } catch (error) {
        console.error('Error fetching conversation:', error)
    } finally {
        loading.value = false
    }
}

async function sendMessage(text) {
    if (!text.trim() || sending.value || !recipient.value) return

    try {
        sending.value = true
        socket.value.emit('new-message', {
            conversationId: route.params.id,
            receiverId: recipient.value._id,
            text: text
        })
    } catch (error) {
        console.error('Error sending message:', error)
    } finally {
        sending.value = false
    }
}

function initializeSocket() {
    socket.value = io(import.meta.env.VITE_API_URL, {
        query: { token: authStore.token }
    })

    socket.value.emit('join-conversation', route.params.id)

    socket.value.on('new-message', (message) => {
        if (message.conversation === route.params.id) {
            messages.value.push(message)
        }
    })

    socket.value.on('typing', (data) => {
        if (data.userId !== authStore.user._id) {
            isTyping.value = true
            setTimeout(() => {
                isTyping.value = false
            }, 3000)
        }
    })

    socket.value.on('stop-typing', (data) => {
        if (data.userId !== authStore.user._id) {
            isTyping.value = false
        }
    })

    socket.value.on('error', (error) => {
        console.error('Socket error:', error)
    })
}

onMounted(() => {
    fetchConversation()
    initializeSocket()
})

onUnmounted(() => {
    if (socket.value) {
        socket.value.emit('leave-conversation', route.params.id)
        socket.value.disconnect()
    }
})
</script>