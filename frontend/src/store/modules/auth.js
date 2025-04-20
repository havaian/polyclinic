import { authService } from '@/services/api'

const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  loading: false,
  error: null
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },
  SET_USER(state, user) {
    state.user = user
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

const actions = {
  async login({ commit }, credentials) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const { data } = await authService.login(credentials)
      commit('SET_TOKEN', data.token)
      commit('SET_USER', data.user)
      return data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка авторизации')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async register({ commit }, userData) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const { data } = await authService.register(userData)
      commit('SET_TOKEN', data.token)
      commit('SET_USER', data.user)
      return data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка регистрации')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async logout({ commit }) {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
    }
  },

  async refreshToken({ commit, state }) {
    if (!state.token) return null

    try {
      const { data } = await authService.refreshToken()
      commit('SET_TOKEN', data.token)
      return data.token
    } catch (error) {
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
      throw error
    }
  },

  async getProfile({ commit }) {
    try {
      commit('SET_LOADING', true)
      const { data } = await authService.getProfile()
      commit('SET_USER', data)
      return data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка получения профиля')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  isAuthenticated: state => !!state.token,
  currentUser: state => state.user,
  isLoading: state => state.loading,
  error: state => state.error
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
} 