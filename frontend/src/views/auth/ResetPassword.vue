<template>
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Reset your password
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Please enter your new password.
                </p>
            </div>

            <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="password" class="sr-only">New password</label>
                        <input id="password" v-model="password" name="password" type="password" required
                            class="input rounded-t-md" placeholder="New password" />
                    </div>
                    <div>
                        <label for="confirmPassword" class="sr-only">Confirm password</label>
                        <input id="confirmPassword" v-model="confirmPassword" name="confirmPassword" type="password"
                            required class="input rounded-b-md" placeholder="Confirm password" />
                    </div>
                </div>

                <div>
                    <button type="submit" class="btn-primary w-full" :disabled="loading || !isValid">
                        {{ loading ? 'Resetting...' : 'Reset Password' }}
                    </button>
                </div>

                <div v-if="error" class="text-sm text-center text-red-600">
                    {{ error }}
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const isValid = computed(() => {
    return password.value.length >= 8 && password.value === confirmPassword.value
})

async function handleSubmit() {
    try {
        if (!isValid.value) {
            error.value = 'Passwords must match and be at least 8 characters long'
            return
        }

        loading.value = true
        error.value = ''

        await axios.post(`/api/users/reset-password/${route.params.token}`, {
            password: password.value
        })

        router.push('/login')
    } catch (err) {
        error.value = err.response?.data?.message || 'Failed to reset password'
    } finally {
        loading.value = false
    }
}
</script>