import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

// Imports for views with lazy-loading
const HomeView = () => import('@/views/HomeView.vue')
const AuthView = () => import('@/views/AuthView.vue')
const ProfileView = () => import('@/views/ProfileView.vue')
const DoctorSearchView = () => import('@/views/DoctorSearchView.vue')
const AppointmentsView = () => import('@/views/AppointmentsView.vue')
const AppointmentDetailsView = () => import('@/views/AppointmentDetailsView.vue')
const ChatView = () => import('@/views/ChatView.vue')
const VideoChatView = () => import('@/views/VideoChatView.vue')
const DocumentsView = () => import('@/views/DocumentsView.vue')
const PaymentView = () => import('@/views/PaymentView.vue')
const AdminView = () => import('@/views/AdminView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')
const DoctorReviewsView = () => import('@/views/DoctorReviewsView.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Главная'
    }
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: {
      title: 'Авторизация'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      title: 'Профиль',
      requiresAuth: true
    }
  },
  {
    path: '/doctors',
    name: 'doctors',
    component: DoctorSearchView,
    meta: {
      title: 'Поиск врачей'
    }
  },
  {
    path: '/doctors/:id/reviews',
    name: 'DoctorReviews',
    component: DoctorReviewsView,
    meta: {
      title: 'Отзывы о враче'
    }
  },
  {
    path: '/appointments',
    name: 'appointments',
    component: AppointmentsView,
    meta: {
      title: 'Мои записи',
      requiresAuth: true
    }
  },
  {
    path: '/appointments/:id',
    name: 'appointment-details',
    component: AppointmentDetailsView,
    meta: {
      title: 'Детали записи',
      requiresAuth: true
    }
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatView,
    meta: {
      title: 'Чат',
      requiresAuth: true
    }
  },
  {
    path: '/chat/:id',
    name: 'chat-with-doctor',
    component: ChatView,
    meta: {
      title: 'Чат с врачом',
      requiresAuth: true
    }
  },
  {
    path: '/video/:id',
    name: 'video-chat',
    component: VideoChatView,
    meta: {
      title: 'Видео-консультация',
      requiresAuth: true
    }
  },
  {
    path: '/documents',
    name: 'documents',
    component: DocumentsView,
    meta: {
      title: 'Мои документы',
      requiresAuth: true
    }
  },
  {
    path: '/payment',
    name: 'payment',
    component: PaymentView,
    meta: {
      title: 'Оплата',
      requiresAuth: true
    }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: {
      title: 'Панель администратора',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      title: 'Страница не найдена'
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  // Set page title
  document.title = `${to.meta.title} | BISP`

  // Check authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters['auth/isAuthenticated']) {
      next({
        path: '/auth',
        query: { redirect: to.fullPath }
      })
    } else {
      // Check admin rights
      if (to.matched.some(record => record.meta.requiresAdmin)) {
        if (!store.getters['auth/isAdmin']) {
          next({ path: '/' })
        } else {
          next()
        }
      } else {
        next()
      }
    }
  } else {
    next()
  }
})

export default router