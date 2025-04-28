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

                            <!-- Specializations -->
                            <div class="mb-4">
                                <label class="label">Specializations</label>
                                <div class="mt-2 space-y-2">
                                    <div v-for="(spec, index) in formData.specializations" :key="index"
                                        class="flex items-center space-x-2">
                                        <select v-model="formData.specializations[index]" class="input flex-1">
                                            <option value="">Select Specialization</option>
                                            <option v-for="s in availableSpecializations" :key="s" :value="s">
                                                {{ s }}
                                            </option>
                                        </select>
                                        <button type="button" class="btn-secondary text-red-600"
                                            @click="removeSpecialization(index)">
                                            Remove
                                        </button>
                                    </div>
                                    <button type="button" class="btn-secondary" @click="addSpecialization">
                                        Add Specialization
                                    </button>
                                </div>
                            </div>

                            <!-- Education -->
                            <div class="mb-4">
                                <label class="label">Education</label>
                                <div class="mt-2 space-y-2">
                                    <div v-for="(edu, index) in formData.education" :key="index"
                                        class="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        <input v-model="edu.degree" type="text" class="input" placeholder="Degree" />
                                        <input v-model="edu.institution" type="text" class="input"
                                            placeholder="Institution" />
                                        <div class="flex items-center space-x-2">
                                            <input v-model="edu.year" type="number" class="input" placeholder="Year" />
                                            <button type="button" class="btn-secondary text-red-600"
                                                @click="removeEducation(index)">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    <button type="button" class="btn-secondary" @click="addEducation">
                                        Add Education
                                    </button>
                                </div>
                            </div>

                            <!-- Consultation Fee -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label for="consultationFee" class="label">Consultation Fee (UZS)</label>
                                    <input id="consultationFee" v-model.number="formData.consultationFee" type="number"
                                        min="0" class="input mt-1" required />
                                </div>
                                <div>
                                    <label for="experience" class="label">Years of Experience</label>
                                    <input id="experience" v-model.number="formData.experience" type="number" min="0"
                                        class="input mt-1" required />
                                </div>
                            </div>

                            <!-- Languages -->
                            <div class="mb-4">
                                <label for="languages" class="label">Languages</label>
                                <div class="mt-2 flex flex-wrap gap-2">
                                    <div v-for="lang in availableLanguages" :key="lang"
                                        class="flex items-center space-x-2">
                                        <input type="checkbox" :id="lang" :value="lang" v-model="formData.languages"
                                            class="rounded text-indigo-600" />
                                        <label :for="lang">{{ lang }}</label>
                                    </div>
                                </div>
                            </div>

                            <!-- Availability -->
                            <div class="mb-4">
                                <label class="label">Availability</label>
                                <div class="mt-2 space-y-4">
                                    <div v-for="(day, index) in formData.availability" :key="index"
                                        class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                        <div class="flex items-center space-x-2">
                                            <input type="checkbox" v-model="day.isAvailable" :id="'day-' + index"
                                                class="rounded text-indigo-600" />
                                            <label :for="'day-' + index">{{ formatDay(index) }}</label>
                                        </div>
                                        <div v-if="day.isAvailable" class="md:col-span-3 grid grid-cols-2 gap-4">
                                            <div>
                                                <label class="sr-only">Start Time</label>
                                                <input type="time" v-model="day.startTime" class="input" required />
                                            </div>
                                            <div>
                                                <label class="sr-only">End Time</label>
                                                <input type="time" v-model="day.endTime" class="input" required />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Bio -->
                            <div class="mb-4">
                                <label for="bio" class="label">About</label>
                                <textarea id="bio" v-model="formData.bio" rows="4" class="input mt-1"
                                    placeholder="Tell us about your professional experience and expertise"></textarea>
                            </div>

                            <!-- Certifications -->
                            <div class="mb-4">
                                <label class="label">Certifications</label>
                                <div class="mt-2 space-y-2">
                                    <div v-for="(cert, index) in formData.certifications" :key="index"
                                        class="flex items-center space-x-2">
                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                                            @change="handleCertificationUpload($event, index)" class="flex-1" />
                                        <button type="button" class="btn-secondary text-red-600"
                                            @click="removeCertification(index)">
                                            Remove
                                        </button>
                                    </div>
                                    <button type="button" class="btn-secondary" @click="addCertification">
                                        Add Certification
                                    </button>
                                </div>
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

const availableSpecializations = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Family Medicine',
    'Gastroenterology',
    'Neurology',
    'Obstetrics & Gynecology',
    'Ophthalmology',
    'Pediatrics',
    'Psychiatry',
    'Pulmonology',
    'Urology'
]

const availableLanguages = [
    'English',
    'Russian',
    'Uzbek',
    'Korean',
    'Turkish'
]

const formData = reactive({
    firstName: '',
    lastName: '',
    phone: '',
    specializations: [],
    education: [],
    consultationFee: 0,
    experience: 0,
    languages: [],
    availability: Array(7).fill().map(() => ({
        isAvailable: false,
        startTime: '09:00',
        endTime: '17:00'
    })),
    bio: '',
    certifications: [],
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

function formatDay(index) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[index]
}

function addSpecialization() {
    formData.specializations.push('')
}

function removeSpecialization(index) {
    formData.specializations.splice(index, 1)
}

function addEducation() {
    formData.education.push({
        degree: '',
        institution: '',
        year: null
    })
}

function removeEducation(index) {
    formData.education.splice(index, 1)
}

function addCertification() {
    formData.certifications.push(null)
}

function removeCertification(index) {
    formData.certifications.splice(index, 1)
}

async function handleCertificationUpload(event, index) {
    const file = event.target.files[0]
    if (!file) return

    try {
        const formData = new FormData()
        formData.append('certification', file)

        const response = await axios.post('/api/users/upload-certification', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        formData.certifications[index] = response.data.url
    } catch (error) {
        console.error('Error uploading certification:', error)
    }
}

async function fetchUserProfile() {
    try {
        const response = await axios.get('/api/users/me')
        const user = response.data.user

        formData.firstName = user.firstName
        formData.lastName = user.lastName
        formData.phone = user.phone

        if (authStore.isDoctor) {
            formData.specializations = user.specializations || []
            formData.education = user.education || []
            formData.consultationFee = user.consultationFee?.amount
            formData.experience = user.experience
            formData.languages = user.languages || []
            formData.availability = user.availability || formData.availability
            formData.bio = user.bio
            formData.certifications = user.certifications || []
        } else {
            formData.medicalHistory.allergies = user.medicalHistory?.allergies?.join(', ') || ''
            formData.medicalHistory.chronicConditions = user.medicalHistory?.chronicConditions?.join(', ') || ''
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
            updateData.specializations = formData.specializations.filter(Boolean)
            updateData.education = formData.education.filter(edu => edu.degree && edu.institution && edu.year)
            updateData.consultationFee = formData.consultationFee
            updateData.experience = formData.experience
            updateData.languages = formData.languages
            updateData.availability = formData.availability
            updateData.bio = formData.bio
            updateData.certifications = formData.certifications.filter(Boolean)
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