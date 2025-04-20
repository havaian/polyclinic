import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

// Импорт представлений
import HomeView from '@/views/HomeView.vue'
import AuthView from '@/views/AuthView.vue'
import ProfileView from '@/views/ProfileView.vue'
import DoctorSearchView from '@/views/DoctorSearchView.vue'
import AppointmentsView from '@/views/AppointmentsView.vue'
import AppointmentDetailsView from '@/views/AppointmentDetailsView.vue'
import ChatView from '@/views/ChatView.vue'
import VideoChatView from '@/views/VideoChatView.vue'
import DocumentsView from '@/views/DocumentsView.vue'
import PaymentView from '@/views/PaymentView.vue'
import AdminView from '@/views/AdminView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

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
    component: () => import('../views/DoctorReviewsView.vue')
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

// Навигационный guard
router.beforeEach((to, from, next) => {
  // Установка заголовка страницы
  document.title = `${to.meta.title} | Медицинский портал`
  
  // Проверка аутентификации
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters['auth/isAuthenticated']) {
      next({
        path: '/auth',
        query: { redirect: to.fullPath }
      })
    } else {
      // Проверка прав администратора
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