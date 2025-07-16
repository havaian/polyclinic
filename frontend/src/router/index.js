import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    // Auth routes
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: {
        requiresGuest: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/Register.vue'),
      meta: {
        requiresGuest: true
      }
    },
    {
      path: '/verify-email/:token',
      name: 'verify-email',
      component: () => import('@/views/auth/VerifyEmail.vue'),
      meta: {
        requiresGuest: true
      }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPassword.vue'),
      meta: {
        requiresGuest: true
      }
    },
    {
      path: '/reset-password/:token',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPassword.vue'),
      meta: {
        requiresGuest: true
      }
    },
    // Profile routes
    {
      path: '/profile/client',
      name: 'client-profile',
      component: () => import('@/views/profile/ClientProfile.vue'),
      meta: {
        requiresAuth: true,
        requiresClient: true
      }
    },
    {
      path: '/profile/provider',
      name: 'provider-profile',
      component: () => import('@/views/profile/ProviderProfile.vue'),
      meta: {
        requiresAuth: true,
        requiresProvider: true
      }
    },
    {
      path: '/profile/edit',
      name: 'profile-edit',
      component: () => import('@/views/profile/EditProfile.vue'),
      meta: {
        requiresAuth: true
      }
    },
    // Provider routes
    {
      path: '/providers',
      name: 'provider-list',
      component: () => import('@/views/providers/ProviderList.vue')
    },
    {
      path: '/providers/:id',
      name: 'provider-profile-view',
      component: () => import('@/views/providers/ProviderProfile.vue')
    },
    // Appointment routes
    {
      path: '/appointments/book/:providerId',
      name: 'book-appointment',
      component: () => import('@/views/appointments/BookAppointment.vue'),
      meta: {
        requiresAuth: true,
        requiresClient: true
      }
    },
    {
      path: '/appointments/client',
      name: 'client-appointments',
      component: () => import('@/views/appointments/ClientAppointments.vue'),
      meta: {
        requiresAuth: true,
        requiresClient: true
      }
    },
    {
      path: '/appointments/provider',
      name: 'provider-appointments',
      component: () => import('@/views/appointments/ProviderAppointments.vue'),
      meta: {
        requiresAuth: true,
        requiresProvider: true
      }
    },
    {
      path: '/appointments/:id',
      name: 'appointment-details',
      component: () => import('@/views/appointments/AppointmentDetails.vue'),
      meta: {
        requiresAuth: true
      }
    },
    // Payment routes
    {
      path: '/payment/success',
      name: 'payment-success',
      component: () => import('@/views/payments/PaymentSuccess.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/payment/cancel',
      name: 'payment-cancel',
      component: () => import('@/views/payments/PaymentCancel.vue'),
      meta: {
        requiresAuth: true
      }
    },
    // Chat routes
    {
      path: '/chat',
      name: 'chat-inbox',
      component: () => import('@/views/chat/ChatInbox.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/chat/:id',
      name: 'chat-conversation',
      component: () => import('@/views/chat/ChatConversation.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/chat/new/:userId',
      name: 'chat-new',
      component: () => import('@/views/chat/ChatConversation.vue'),
      meta: {
        requiresAuth: true
      }
    },
    // Session routes
    {
      path: '/session/:appointmentId',
      name: 'session-room',
      component: () => import('@/views/sessions/SessionRoom.vue'),
      meta: {
        requiresAuth: true,
        hideNavBar: true,
        hideFooter: true
      }
    },
    // Error routes
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else if (to.meta.requiresClient && !authStore.isClient) {
    next('/')
  } else if (to.meta.requiresProvider && !authStore.isProvider) {
    next('/')
  } else {
    next()
  }
})

export default router