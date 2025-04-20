import axios from 'axios'
import store from '@/store'
import router from '@/router'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = store.state.auth.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          store.dispatch('auth/logout')
          router.push('/auth')
          break
        case 403:
          router.push('/')
          break
        case 404:
          router.push('/404')
          break
        case 500:
          // Обработка серверной ошибки
          break
      }
    }
    return Promise.reject(error)
  }
)

// Auth Service
export const authService = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  logout: () => api.post('/users/logout'),
  refreshToken: () => api.post('/users/refresh-token'),
  getProfile: () => api.get('/users/profile')
}

// User Service
export const userService = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  uploadAvatar: (id, formData) => api.post(`/users/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Appointment Service
export const appointmentService = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id) => api.delete(`/appointments/${id}`)
}

// Doctor Service
export const doctorService = {
  getAll: (params) => api.get('/users/doctors', { params }),
  getById: (id) => api.get(`/users/doctors/${id}`),
  getAvailability: (id, date) => api.get(`/users/doctors/${id}/availability`, { params: { date } })
}

// Consultation Service
export const consultationService = {
  start: (appointmentId) => api.post(`/consultations/${appointmentId}/start`),
  end: (appointmentId) => api.post(`/consultations/${appointmentId}/end`),
  getHistory: (params) => api.get('/consultations/history', { params })
}

// Payment Service
export const paymentService = {
  createPaymentIntent: (appointmentId) => api.post(`/payments/create-intent`, { appointmentId }),
  getPaymentHistory: (params) => api.get('/payments/history', { params }),
  getPaymentStatus: (paymentId) => api.get(`/payments/${paymentId}/status`)
}

// Specialization Service
export const specializationService = {
  getAll: () => api.get('/specializations'),
  getById: (id) => api.get(`/specializations/${id}`)
}

// Admin Service
export const adminService = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getDoctors: (params) => api.get('/admin/doctors', { params }),
  getAppointments: (params) => api.get('/admin/appointments', { params }),
  getPayments: (params) => api.get('/admin/payments', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`, data)
}

// Document Service
export const documentService = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => api.get('/documents', { params }),
  delete: (id) => api.delete(`/documents/${id}`)
}

export default api 