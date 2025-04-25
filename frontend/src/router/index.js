import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '@/views/Home.vue'
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'
import DoctorList from '@/views/doctors/DoctorList.vue'
import DoctorProfile from '@/views/doctors/DoctorProfile.vue'
import BookAppointment from '@/views/appointments/BookAppointment.vue'
import PatientAppointments from '@/views/appointments/PatientAppointments.vue'
import DoctorAppointments from '@/views/appointments/DoctorAppointments.vue'
import AppointmentDetails from '@/views/appointments/AppointmentDetails.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: {
                requiresGuest: true
            }
        },
        {
            path: '/register',
            name: 'register',
            component: Register,
            meta: {
                requiresGuest: true
            }
        },
        {
            path: '/doctors',
            name: 'doctor-list',
            component: DoctorList
        },
        {
            path: '/doctors/:id',
            name: 'doctor-profile',
            component: DoctorProfile
        },
        {
            path: '/appointments/book/:doctorId',
            name: 'book-appointment',
            component: BookAppointment,
            meta: {
                requiresAuth: true,
                requiresPatient: true
            }
        },
        {
            path: '/appointments/patient',
            name: 'patient-appointments',
            component: PatientAppointments,
            meta: {
                requiresAuth: true,
                requiresPatient: true
            }
        },
        {
            path: '/appointments/doctor',
            name: 'doctor-appointments',
            component: DoctorAppointments,
            meta: {
                requiresAuth: true,
                requiresDoctor: true
            }
        },
        {
            path: '/appointments/:id',
            name: 'appointment-details',
            component: AppointmentDetails,
            meta: {
                requiresAuth: true
            }
        }
    ]
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login')
    } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
        next('/')
    } else if (to.meta.requiresPatient && !authStore.isPatient) {
        next('/')
    } else if (to.meta.requiresDoctor && !authStore.isDoctor) {
        next('/')
    } else {
        next()
    }
})

export default router