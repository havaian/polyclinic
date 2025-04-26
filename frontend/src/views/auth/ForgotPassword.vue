<template>
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Forgot your password?
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>

            <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
                <div>
                    <label for="email" class="sr-only">Email address</label>
                    <input id="email" v-model="email" name="email" type="email" required class="input rounded-md"
                        placeholder="Email address" />
                </div>

                <div>
                    <button type="submit" class="btn-primary w-full" :disabled="loading">
                        {{ loading ? 'Sending...' : 'Send Reset Link' }}
                    </button>
                </div>

                <div v-if="message" class="text-sm text-center" :class="error ? 'text-red-600' : 'text-green-600'">
                    {{ message }}
                </div>
            </form>

            <div class="text-sm text-center">
                <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
                    Back to login
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref(false)

async function handleSubmit() {
    try {
        loading.value = true
        message.value = ''
        error.value = false

        await axios.post('/api/users/forgot-password', { email: email.value })

        message.value = 'Password reset instructions have been sent to your email.'
        email.value = ''
    } catch (err) {
        error.value = true
        message.value = err.response?.data?.message || 'Failed to process request'
    } finally {
        loading.value = false
    }
}
</script>