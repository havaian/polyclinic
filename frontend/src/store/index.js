import { createStore } from 'vuex'
import api from '../services/api'

export default createStore({
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    appointments: []
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
        state.isAuthenticated = true
      } else {
        localStorage.removeItem('token')
        state.isAuthenticated = false
      }
    },
    CLEAR_AUTH(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    },
    SET_APPOINTMENTS(state, appointments) {
      state.appointments = appointments
    }
  },
  
  actions: {
    async login({ commit }, { email, password }) {
      try {
        const response = await api.post('/auth/login', { email, password })
        const { token, user } = response.data
        commit('SET_TOKEN', token)
        commit('SET_USER', user)
        return response
      } catch (error) {
        throw error
      }
    },

    async register({ commit }, { name, email, password }) {
      try {
        const response = await api.post('/auth/register', { name, email, password })
        return response
      } catch (error) {
        throw error
      }
    },

    async logout({ commit }) {
      try {
        await api.post('/auth/logout')
        commit('CLEAR_AUTH')
      } catch (error) {
        console.error('Logout error:', error)
        commit('CLEAR_AUTH')
      }
    },

    async fetchUserProfile({ commit }) {
      try {
        const response = await api.get('/users/profile')
        commit('SET_USER', response.data)
        return response.data
      } catch (error) {
        throw error
      }
    },

    async fetchAppointments({ commit }) {
      try {
        const response = await api.get('/appointments')
        commit('SET_APPOINTMENTS', response.data)
        return response.data
      } catch (error) {
        throw error
      }
    },

    async updateProfile({ commit }, userData) {
      try {
        const response = await api.put('/users/profile', userData)
        commit('SET_USER', response.data)
        return response.data
      } catch (error) {
        throw error
      }
    }
  },
  
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    userAppointments: state => state.appointments
  }
}) 