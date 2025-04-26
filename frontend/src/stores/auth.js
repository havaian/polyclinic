import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)
  const isDoctor = computed(() => user.value?.role === 'doctor')
  const isPatient = computed(() => user.value?.role === 'patient')

  async function login(email, password) {
    try {
      const response = await axios.post('/api/users/login', { email, password })
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', token.value)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  async function register(userData) {
    try {
      const response = await axios.post('/api/users/register', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    isAuthenticated,
    isDoctor,
    isPatient,
    login,
    register,
    logout
  }
})