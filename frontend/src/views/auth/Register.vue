<template>
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
            </div>

            <div v-if="registrationSuccess" class="rounded-md bg-green-50 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-green-800">Registration successful!</h3>
                        <div class="mt-2 text-sm text-green-700">
                            <p>Please check your email to verify your account before logging in.</p>
                        </div>
                        <div class="mt-4">
                            <router-link to="/login" class="text-sm font-medium text-green-600 hover:text-green-500">
                                Go to login page →
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>

            <form v-else class="mt-8 space-y-6" @submit.prevent="handleSubmit">
                <div class="rounded-md shadow-sm space-y-4">
                    <div>
                        <label for="role" class="label">I am a</label>
                        <select id="role" v-model="formData.role" class="input mt-1" required>
                            <option value="client">Client</option>
                            <option value="provider">Provider</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="firstName" class="label">First Name</label>
                            <input id="firstName" v-model="formData.firstName" type="text" required
                                class="input mt-1" />
                        </div>
                        <div>
                            <label for="lastName" class="label">Last Name</label>
                            <input id="lastName" v-model="formData.lastName" type="text" required class="input mt-1" />
                        </div>
                    </div>

                    <div>
                        <label for="email" class="label">Email address</label>
                        <input id="email" v-model="formData.email" type="email" required class="input mt-1" />
                    </div>

                    <div>
                        <label for="phone" class="label">Phone number</label>
                        <input id="phone" v-model="formData.phone" type="tel" required class="input mt-1"
                            placeholder="+998901234567" />
                    </div>

                    <div>
                        <label for="password" class="label">Password</label>
                        <input id="password" v-model="formData.password" type="password" required class="input mt-1" />
                    </div>

                    <!-- Removed: Date of Birth and Gender moved to conditional blocks -->

                    <template v-if="formData.role === 'provider'">
                        <div>
                            <label for="expertise" class="label">Expertise</label>
                            <div class="space-y-2">
                                <div v-for="(spec, index) in formData.expertise" :key="index" class="flex gap-2">
                                    <select v-model="formData.expertise[index]" class="input flex-1">
                                        <option value="">Select Specialization</option>
                                        <option v-for="spec in availableExpertise" :key="spec" :value="spec">
                                            {{ spec }}
                                        </option>
                                    </select>
                                    <button type="button" @click="removeSpecialization(index)"
                                        class="px-2 py-1 text-red-600 hover:text-red-800">
                                        Remove
                                    </button>
                                </div>
                                <button type="button" @click="addSpecialization"
                                    class="text-sm bg-gradient-to-r from-medical-blue to-medical-teal bg-clip-text text-transparent  hover:text-indigo-800">
                                    + Add Specialization
                                </button>
                            </div>
                        </div>

                        <div>
                            <label for="licenseNumber" class="label">License Number</label>
                            <input id="licenseNumber" v-model="formData.licenseNumber" type="text" required
                                class="input mt-1" />
                        </div>

                        <div>
                            <label for="experience" class="label">Years of Experience</label>
                            <input id="experience" v-model.number="formData.experience" type="number" min="0" required
                                class="input mt-1" />
                        </div>

                        <div>
                            <label for="sessionFee" class="label">Session Fee (UZS)</label>
                            <input id="sessionFee" v-model.number="formData.sessionFee" type="number" min="0"
                                required class="input mt-1" />
                        </div>

                        <div>
                            <label for="languages" class="label">Languages</label>
                            <input id="languages" v-model="languagesInput" type="text" class="input mt-1"
                                placeholder="English, Russian, Uzbek (comma separated)" />
                        </div>
                    </template>

                    <!-- Date of Birth - Only for clients -->
                    <div v-if="formData.role === 'client'">
                        <label for="dateOfBirth" class="label">Date of Birth</label>
                        <input id="dateOfBirth" v-model="formData.dateOfBirth" type="date" required class="input mt-1"
                            :max="maxDate" />
                    </div>

                    <!-- Gender - Only for clients -->
                    <div v-if="formData.role === 'client'">
                        <label for="gender" class="label">Gender</label>
                        <select id="gender" v-model="formData.gender" class="input mt-1" required>
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer not to say">Prefer not to say</option>
                        </select>
                    </div>
                </div>

                <div>
                    <button type="submit" class="btn-primary w-full" :disabled="loading">
                        {{ loading ? 'Creating account...' : 'Create account' }}
                    </button>
                </div>
            </form>

            <p class="mt-2 text-center text-sm text-gray-600">
                Already have an account?
                <router-link to="/login" class="font-medium bg-gradient-to-r from-medical-blue to-medical-teal bg-clip-text text-transparent  hover:text-indigo-500">
                    Sign in
                </router-link>
            </p>

            <div v-if="error" class="mt-4 text-sm text-center text-red-600">
                {{ error }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

const availableExpertise = ref([])
const languagesInput = ref('')

const formData = reactive({
    role: 'client',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    gender: '',
    expertise: [],
    licenseNumber: '',
    experience: 0,
    sessionFee: 0
})

const registrationSuccess = ref(false)
const loading = ref(false)
const error = ref('')

// Calculate max date (18 years ago from today)
const maxDate = computed(() => {
    const date = new Date()
    date.setFullYear(date.getFullYear() - 18)
    return date.toISOString().split('T')[0]
})

// Helper functions for expertise
const addSpecialization = () => {
    formData.expertise.push('')
}

const removeSpecialization = (index) => {
    formData.expertise.splice(index, 1)
}

// Add default empty specialization when switching to provider role
const watchRole = () => {
    if (formData.role === 'provider' && formData.expertise.length === 0) {
        formData.expertise.push('')
    }
}

async function handleSubmit() {
    try {
        loading.value = true;
        error.value = '';

        // Create a copy of the formData to modify before sending
        const registrationData = { ...formData };

        if (registrationData.role === 'provider') {
            // Make sure expertise is processed properly
            registrationData.expertise = formData.expertise.filter(s => s !== "");

            // Process languages for provider registration
            if (languagesInput.value) {
                registrationData.languages = languagesInput.value.split(',').map(lang => lang.trim()).filter(Boolean);
            } else {
                registrationData.languages = [];
            }

            // Remove client-only fields for provider registration
            delete registrationData.dateOfBirth;
            delete registrationData.gender;
        } else {
            // For client registration, remove all provider-specific fields
            delete registrationData.expertise;
            delete registrationData.licenseNumber;
            delete registrationData.experience;
            delete registrationData.sessionFee;
            delete registrationData.languages;
        }

        await authStore.register(registrationData);
        registrationSuccess.value = true;
    } catch (err) {
        error.value = err.message || 'Failed to create account';
    } finally {
        loading.value = false;
    }
}

async function fetchExpertise() {
    try {
        const response = await axios.get('/api/expertise')
        availableExpertise.value = response.data.expertise.map(s => s.name)
    } catch (error) {
        console.error('Error fetching expertise:', error)
        // Set some defaults in case API call fails
        availableExpertise.value = [
            'Cardiology',
            'Pediatrics',
            'Dermatology',
            'Neurology',
            'Orthopedics',
            'Gynecology',
            'Psychiatry',
            'Ophthalmology',
            'General Medicine',
            'Endocrinology'
        ]
    }
}

onMounted(() => {
    fetchExpertise()
})
</script>