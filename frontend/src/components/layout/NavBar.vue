<template>
    <nav class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex">
                    <div class="flex-shrink-0 flex items-center">
                        <router-link to="/" class="text-xl font-bold text-indigo-600">
                            E-Polyclinic
                        </router-link>
                    </div>
                    <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                        <router-link to="/" class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                            :class="{ 'border-b-2 border-indigo-500': route.path === '/' }">
                            Home
                        </router-link>
                        <router-link to="/doctors"
                            class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                            :class="{ 'border-b-2 border-indigo-500': route.path === '/doctors' }">
                            Find Doctors
                        </router-link>
                        <template v-if="authStore.isAuthenticated">
                            <router-link v-if="authStore.isPatient" to="/appointments/patient"
                                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                                :class="{ 'border-b-2 border-indigo-500': route.path === '/appointments/patient' }">
                                My Appointments
                            </router-link>
                            <router-link v-if="authStore.isDoctor" to="/appointments/doctor"
                                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                                :class="{ 'border-b-2 border-indigo-500': route.path === '/appointments/doctor' }">
                                My Schedule
                            </router-link>
                        </template>
                    </div>
                </div>
                <div class="flex items-center">
                    <template v-if="authStore.isAuthenticated">
                        <button @click="logout"
                            class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                            Sign out
                        </button>
                    </template>
                    <template v-else>
                        <router-link to="/login"
                            class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                            Sign in
                        </router-link>
                    </template>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

async function logout() {
    authStore.logout()
    router.push('/login')
}
</script>