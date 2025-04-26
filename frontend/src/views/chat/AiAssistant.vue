<template>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white shadow rounded-lg overflow-hidden">
            <!-- Chat Header -->
            <div class="p-4 border-b border-gray-200">
                <h1 class="text-lg font-medium text-gray-900">AI Medical Assistant</h1>
                <p class="mt-1 text-sm text-gray-500">
                    Ask general health questions and get instant guidance
                </p>
            </div>

            <!-- Chat Messages -->
            <div class="h-[600px] overflow-y-auto p-4" ref="chatContainer">
                <div class="space-y-4">
                    <template v-if="messages.length === 0">
                        <div class="text-center text-gray-500">
                            <p>👋 Hi! I'm your AI medical assistant.</p>
                            <p>How can I help you today?</p>
                        </div>
                    </template>

                    <div v-for="message in messages" :key="message.id" class="flex"
                        :class="message.sender === 'user' ? 'justify-end' : 'justify-start'">
                        <div class="rounded-lg px-4 py-2 max-w-[80%]"
                            :class="message.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'">
                            {{ message.text }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Input Area -->
            <div class="p-4 border-t border-gray-200">
                <form @submit.prevent="sendMessage" class="flex space-x-2">
                    <input v-model="newMessage" type="text" class="input flex-1" placeholder="Type your message..."
                        :disabled="loading" />
                    <button type="submit" class="btn-primary" :disabled="loading || !newMessage.trim()">
                        {{ loading ? 'Sending...' : 'Send' }}
                    </button>
                </form>
                <p class="mt-2 text-xs text-gray-500">
                    Note: This is for general information only. Always consult a doctor for medical advice.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const chatContainer = ref(null)
const messages = ref([])
const newMessage = ref('')
const loading = ref(false)

async function sendMessage() {
    if (!newMessage.value.trim() || loading.value) return

    const messageText = newMessage.value
    newMessage.value = ''

    // Add user message
    messages.value.push({
        id: Date.now(),
        text: messageText,
        sender: 'user'
    })

    // Scroll to bottom
    await nextTick()
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }

    try {
        loading.value = true

        // Send message to AI assistant
        const response = await axios.post('/api/assistant/chat', {
            message: messageText,
            userId: authStore.user.id
        })

        // Add assistant response
        messages.value.push({
            id: Date.now(),
            text: response.data.reply,
            sender: 'assistant'
        })

        // Scroll to bottom
        await nextTick()
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
    } catch (error) {
        console.error('Error sending message:', error)
        messages.value.push({
            id: Date.now(),
            text: 'Sorry, I encountered an error. Please try again.',
            sender: 'assistant'
        })
    } finally {
        loading.value = false
    }
}
</script>