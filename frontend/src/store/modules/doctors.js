import { doctorService, specializationService } from '@/services/api'

const state = {
  doctors: [],
  currentDoctor: null,
  specializations: [],
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1
}

const mutations = {
  SET_DOCTORS(state, doctors) {
    state.doctors = doctors
  },
  SET_CURRENT_DOCTOR(state, doctor) {
    state.currentDoctor = doctor
  },
  SET_SPECIALIZATIONS(state, specializations) {
    state.specializations = specializations
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
  async fetchDoctors({ commit }, params) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const { data } = await doctorService.getAll(params)
      commit('SET_DOCTORS', data.doctors)
      commit('SET_PAGINATION', {
        totalPages: data.totalPages,
        currentPage: data.currentPage
      })
      return data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка получения списка врачей')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchDoctorById({ commit }, id) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const { data } = await doctorService.getById(id)
      commit('SET_CURRENT_DOCTOR', data)
      return data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка получения информации о враче')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchSpecializations({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const { data } = await specializationService.getAll()
      commit('SET_SPECIALIZATIONS', data)
      return data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка получения списка специализаций')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async getDoctorAvailability({ commit }, { id, date }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      const { data } = await doctorService.getAvailability(id, date)
      return data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || 'Ошибка получения доступного времени')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  doctors: state => state.doctors,
  currentDoctor: state => state.currentDoctor,
  specializations: state => state.specializations,
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