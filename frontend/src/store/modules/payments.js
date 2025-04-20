import { paymentService } from '@/services/api'

const state = {
  paymentHistory: [],
  currentPayment: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1
}

const mutations = {
  SET_PAYMENT_HISTORY(state, history) {
    state.paymentHistory = history
  },
  SET_CURRENT_PAYMENT(state, payment) {
    state.currentPayment = payment
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  SET_PAGINATION(state, { totalPages, currentPage }) {
    state.totalPages = totalPages
    state.currentPage = currentPage
  }
}

const actions = {
  async fetchPaymentHistory({ commit }, params) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const { data } = await paymentService.getPaymentHistory(params)
      commit('SET_PAYMENT_HISTORY', data.payments)
      commit('SET_PAGINATION', {
        totalPages: data.totalPages,
        currentPage: data.currentPage
      })
      return data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка получения истории платежей')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createPaymentIntent({ commit }, appointmentId) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const { data } = await paymentService.createPaymentIntent(appointmentId)
      return data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка создания платежа')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async getPaymentStatus({ commit }, paymentId) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const { data } = await paymentService.getPaymentStatus(paymentId)
      return data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка получения статуса платежа')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  paymentHistory: state => state.paymentHistory,
  currentPayment: state => state.currentPayment,
  isLoading: state => state.loading,
  error: state => state.error,
  totalPages: state => state.totalPages,
  currentPage: state => state.currentPage
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
} 