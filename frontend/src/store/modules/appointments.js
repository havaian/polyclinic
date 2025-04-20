import { appointmentService } from '@/services/api'

const state = {
  appointments: [],
  currentAppointment: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1
}

const mutations = {
  SET_APPOINTMENTS(state, appointments) {
    state.appointments = appointments
  },
  SET_CURRENT_APPOINTMENT(state, appointment) {
    state.currentAppointment = appointment
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
  async fetchAppointments({ commit }, params) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const { data } = await appointmentService.getAll(params)
      commit('SET_APPOINTMENTS', data.appointments)
      commit('SET_PAGINATION', {
        totalPages: data.totalPages,
        currentPage: data.currentPage
      })
      return data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка получения записей')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchAppointmentById({ commit }, id) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const { data } = await appointmentService.getById(id)
      commit('SET_CURRENT_APPOINTMENT', data)
      return data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка получения записи')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createAppointment({ commit, dispatch }, appointmentData) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const { data } = await appointmentService.create(appointmentData)
      await dispatch('fetchAppointments')
      return data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка создания записи')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateAppointment({ commit, dispatch }, { id, data }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const response = await appointmentService.update(id, data)
      await dispatch('fetchAppointments')
      return response.data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка обновления записи')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async cancelAppointment({ commit, dispatch }, id) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      await appointmentService.cancel(id)
      await dispatch('fetchAppointments')
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка отмены записи')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  appointments: state => state.appointments,
  currentAppointment: state => state.currentAppointment,
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