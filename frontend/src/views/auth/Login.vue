<template>
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            </div>
            <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="email" class="sr-only">Email address</label>
                        <input id="email" v-model="email" name="email" type="email" required class="input rounded-t-md"
                            placeholder="Email address" />
                    </div>
                    <div>
                        <label for="password" class="sr-only">Password</label>
                        <input id="password" v-model="password" name="password" type="password" required
                            class="input rounded-b-md" placeholder="Password" />
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="text-sm">
                        <router-link to="/forgot-password" class="font-medium text-indigo-600 hover:text-indigo-500">
                            Forgot your password?
                        </router-link>
                    </div>
                </div>

                <div>
                    <button type="submit" class="btn-primary w-full" :disabled="loading">
                        {{ loading ? 'Signing in...' : 'Sign in' }}
                    </button>
                </div>
            </form>

            <p class="mt-2 text-center text-sm text-gray-600">
                Don't have an account?
                <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign up
                </router-link>
            </p>

            <div v-if="error"
                class="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm text-center">
                {{ error }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
    if (loading.value) return

    try {
        loading.value = true
        error.value = ''
        await authStore.login(email.value, password.value)
        router.push('/')
    } catch (err) {
        error.value = err.message || 'Failed to sign in'
    } finally {
        loading.value = false
    }
}
</script>
