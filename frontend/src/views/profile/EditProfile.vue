<template>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="p-6">
                <h1 class="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <!-- Personal Information -->
                    <div>
                        <h2 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="firstName" class="label">First Name</label>
                                <input id="firstName" v-model="formData.firstName" type="text" class="input mt-1"
                                    required />
                            </div>
                            <div>
                                <label for="lastName" class="label">Last Name</label>
                                <input id="lastName" v-model="formData.lastName" type="text" class="input mt-1"
                                    required />
                            </div>
                            <div>
                                <label for="phone" class="label">Phone</label>
                                <input id="phone" v-model="formData.phone" type="tel" class="input mt-1" required />
                            </div>
                        </div>
                    </div>

                    <!-- Doctor-specific fields -->
                    <template v-if="authStore.isDoctor">
                        <div>
                            <h2 class="text-lg font-medium text-gray-900 mb-4">Professional Information</h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="consultationFee" class="label">Consultation Fee (UZS)</label>
                                    <input id="consultationFee" v-model.number="formData.consultationFee" type="number"
                                        min="0" class="input mt-1" required />
                                </div>
                                <div>
                                    <label for="languages" class="label">Languages</label>
                                    <input id="languages" v-model="formData.languages" type="text" class="input mt-1"
                                        placeholder="English, Russian, Uzbek" />
                                </div>
                            </div>
                            <div class="mt-4">
                                <label for="bio" class="label">Bio</label>
                                <textarea id="bio" v-model="formData.bio" rows="4" class="input mt-1"></textarea>
                            </div>
                        </div>
                    </template>

                    <!-- Patient-specific fields -->
                    <template v-else>
                        <div>
                            <h2 class="text-lg font-medium text-gray-900 mb-4">Medical Information</h2>
                            <div class="space-y-4">
                                <div>
                                    <label for="allergies" class="label">Allergies</label>
                                    <input id="allergies" v-model="formData.medicalHistory.allergies" type="text"
                                        class="input mt-1" placeholder="Separate with commas" />
                                </div>
                                <div>
                                    <label for="chronicConditions" class="label">Chronic Conditions</label>
                                    <input id="chronicConditions" v-model="formData.medicalHistory.chronicConditions"
                                        type="text" class="input mt-1" placeholder="Separate with commas" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 class="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="emergencyName" class="label">Name</label>
                                    <input id="emergencyName" v-model="formData.emergencyContact.name" type="text"
                                        class="input mt-1" />
                                </div>
                                <div>
                                    <label for="emergencyPhone" class="label">Phone</label>
                                    <input id="emergencyPhone" v-model="formData.emergencyContact.phone" type="tel"
                                        class="input mt-1" />
                                </div>
                                <div>
                                    <label for="emergencyRelationship" class="label">Relationship</label>
                                    <input id="emergencyRelationship" v-model="formData.emergencyContact.relationship"
                                        type="text" class="input mt-1" />
                                </div>
                            </div>
                        </div>
                    </template>

                    <div class="flex justify-end space-x-4">
                        <router-link :to="{ name: authStore.isDoctor ? 'doctor-profile' : 'patient-profile' }"
                            class="btn-secondary">
                            Cancel
                        </router-link>
                        <button type="submit" class="btn-primary" :disabled="loading">
                            {{ loading ? 'Saving...' : 'Save Changes' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const formData = reactive({
    firstName: '',
    lastName: '',
    phone: '',
    consultationFee: 0,
    languages: '',
    bio: '',
    medicalHistory: {
        allergies: '',
        chronicConditions: ''
    },
    emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
    }
})

async function fetchUserProfile() {
    try {
        const response = await axios.get('/api/users/me')
        const user = response.data.user

        formData.firstName = user.firstName
        formData.lastName = user.lastName
        formData.phone = user.phone

        if (authStore.isDoctor) {
            formData.consultationFee = user.consultationFee?.amount
            formData.languages = user.languages?.join(', ')
            formData.bio = user.bio
        } else {
            formData.medicalHistory.allergies = user.medicalHistory?.allergies?.join(', ')
            formData.medicalHistory.chronicConditions = user.medicalHistory?.chronicConditions?.join(', ')
            formData.emergencyContact = user.emergencyContact || {}
        }
    } catch (error) {
        console.error('Error fetching user profile:', error)
    }
}

async function handleSubmit() {
    try {
        loading.value = true

        const updateData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone
        }

        if (authStore.isDoctor) {
            updateData.consultationFee = formData.consultationFee
            updateData.languages = formData.languages.split(',').map(lang => lang.trim())
            updateData.bio = formData.bio
        } else {
            updateData.medicalHistory = {
                allergies: formData.medicalHistory.allergies.split(',').map(item => item.trim()),
                chronicConditions: formData.medicalHistory.chronicConditions.split(',').map(item => item.trim())
            }
            updateData.emergencyContact = formData.emergencyContact
        }

        await axios.patch('/api/users/me', updateData)
        router.push({ name: authStore.isDoctor ? 'doctor-profile' : 'patient-profile' })
    } catch (error) {
        console.error('Error updating profile:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchUserProfile()
})
</script>