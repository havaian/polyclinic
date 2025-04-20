import api from '@/services/api'

export default {
  namespaced: true,
  
  state: {
    list: [],
    current: null,
    loading: false,
    error: null
  },
  
  getters: {
    getReviewById: (state) => (id) => {
      return state.list.find(review => review.id === id)
    },
    
    getReviewsByDoctorId: (state) => (doctorId) => {
      return state.list.filter(review => review.doctorId === doctorId)
    },
    
    getReviewsByAppointmentId: (state) => (appointmentId) => {
      return state.list.filter(review => review.appointmentId === appointmentId)
    },
    
    getAverageRating: (state) => (doctorId) => {
      const doctorReviews = state.list.filter(review => review.doctorId === doctorId)
      if (doctorReviews.length === 0) return 0
      
      const sum = doctorReviews.reduce((total, review) => total + review.rating, 0)
      return sum / doctorReviews.length
    }
  },
  
  mutations: {
    SET_LIST(state, reviews) {
      state.list = reviews
    },
    
    SET_CURRENT(state, review) {
      state.current = review
    },
    
    ADD_REVIEW(state, review) {
      state.list.push(review)
    },
    
    UPDATE_REVIEW(state, updatedReview) {
      const index = state.list.findIndex(review => review.id === updatedReview.id)
      if (index !== -1) {
        state.list.splice(index, 1, updatedReview)
      }
    },
    
    REMOVE_REVIEW(state, id) {
      state.list = state.list.filter(review => review.id !== id)
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async fetchAll({ commit }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.get('/reviews')
        commit('SET_LIST', response.data)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchById({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        const response = await api.get(`/reviews/${id}`)
        commit('SET_CURRENT', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchByDoctorId({ commit }, doctorId) {
      try {
        commit('SET_LOADING', true)
        const response = await api.get(`/doctors/${doctorId}/reviews`)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchByAppointmentId({ commit }, appointmentId) {
      try {
        commit('SET_LOADING', true)
        const response = await api.get(`/appointments/${appointmentId}/review`)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async create({ commit }, reviewData) {
      try {
        commit('SET_LOADING', true)
        const response = await api.post('/reviews', reviewData)
        commit('ADD_REVIEW', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async update({ commit }, { id, data }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.put(`/reviews/${id}`, data)
        commit('UPDATE_REVIEW', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async delete({ commit }, id) {
      try {
        commit('SET_LOADING', true)
        await api.delete(`/reviews/${id}`)
        commit('REMOVE_REVIEW', id)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createForAppointment({ commit }, { appointmentId, rating, text }) {
      try {
        commit('SET_LOADING', true)
        const response = await api.post(`/appointments/${appointmentId}/review`, {
          rating,
          text
        })
        commit('ADD_REVIEW', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
} 