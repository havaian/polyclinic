import { createStore } from 'vuex'
import auth from './modules/auth'
import appointments from './modules/appointments'
import doctors from './modules/doctors'
import payments from './modules/payments'

export default createStore({
  modules: {
    auth,
    appointments,
    doctors,
    payments
  }
}) 