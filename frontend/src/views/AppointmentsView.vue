<template>
  <div class="appointments">
    <v-container>
      <h1 class="text-h4 mb-6">Мои записи</h1>
      
      <!-- Вкладки -->
      <v-tabs v-model="activeTab" class="mb-6">
        <v-tab value="upcoming">Предстоящие</v-tab>
        <v-tab value="past">Прошедшие</v-tab>
        <v-tab value="cancelled">Отмененные</v-tab>
      </v-tabs>
      
      <!-- Список записей -->
      <v-window v-model="activeTab">
        <v-window-item value="upcoming">
          <v-row>
            <v-col
              v-for="appointment in upcomingAppointments"
              :key="appointment.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card class="appointment-card h-100" elevation="2">
                <v-card-text>
                  <div class="d-flex align-center mb-4">
                    <v-avatar size="48" class="mr-4">
                      <v-img :src="appointment.doctor.avatar"></v-img>
                    </v-avatar>
                    <div>
                      <h3 class="text-h6 mb-1">
                        {{ appointment.doctor.firstName }} {{ appointment.doctor.lastName }}
                      </h3>
                      <p class="text-subtitle-2 text-medium-emphasis">
                        {{ appointment.doctor.specialization }}
                      </p>
                    </div>
                  </div>
                  
                  <v-divider class="mb-4"></v-divider>
                  
                  <div class="mb-4">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="mr-2">mdi-calendar</v-icon>
                      <span>{{ formatDate(appointment.dateTime) }}</span>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="mr-2">mdi-clock</v-icon>
                      <span>{{ formatTime(appointment.dateTime) }}</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon color="primary" class="mr-2">mdi-currency-rub</v-icon>
                      <span>{{ formatPrice(appointment.price) }}</span>
                    </div>
                  </div>
                  
                  <v-divider class="mb-4"></v-divider>
                  
                  <div class="d-flex align-center justify-space-between">
                    <v-chip
                      :color="getStatusColor(appointment.status)"
                      size="small"
                    >
                      {{ getStatusText(appointment.status) }}
                    </v-chip>
                    
                    <div>
                      <v-btn
                        v-if="appointment.status === 'pending'"
                        color="error"
                        variant="text"
                        size="small"
                        class="mr-2"
                        @click="cancelAppointment(appointment.id)"
                      >
                        Отменить
                      </v-btn>
                      
                      <v-btn
                        v-if="appointment.status === 'confirmed'"
                        color="primary"
                        variant="text"
                        size="small"
                        @click="startVideoCall(appointment.id)"
                      >
                        Начать консультацию
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
        
        <v-window-item value="past">
          <v-row>
            <v-col
              v-for="appointment in pastAppointments"
              :key="appointment.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card class="appointment-card h-100" elevation="2">
                <v-card-text>
                  <div class="d-flex align-center mb-4">
                    <v-avatar size="48" class="mr-4">
                      <v-img :src="appointment.doctor.avatar"></v-img>
                    </v-avatar>
                    <div>
                      <h3 class="text-h6 mb-1">
                        {{ appointment.doctor.firstName }} {{ appointment.doctor.lastName }}
                      </h3>
                      <p class="text-subtitle-2 text-medium-emphasis">
                        {{ appointment.doctor.specialization }}
                      </p>
                    </div>
                  </div>
                  
                  <v-divider class="mb-4"></v-divider>
                  
                  <div class="mb-4">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="mr-2">mdi-calendar</v-icon>
                      <span>{{ formatDate(appointment.dateTime) }}</span>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="mr-2">mdi-clock</v-icon>
                      <span>{{ formatTime(appointment.dateTime) }}</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon color="primary" class="mr-2">mdi-currency-rub</v-icon>
                      <span>{{ formatPrice(appointment.price) }}</span>
                    </div>
                  </div>
                  
                  <v-divider class="mb-4"></v-divider>
                  
                  <div class="d-flex align-center justify-space-between">
                    <v-chip
                      :color="getStatusColor(appointment.status)"
                      size="small"
                    >
                      {{ getStatusText(appointment.status) }}
                    </v-chip>
                    
                    <v-btn
                      color="primary"
                      variant="text"
                      size="small"
                      @click="viewAppointmentDetails(appointment.id)"
                    >
                      Детали
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
        
        <v-window-item value="cancelled">
          <v-row>
            <v-col
              v-for="appointment in cancelledAppointments"
              :key="appointment.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card class="appointment-card h-100" elevation="2">
                <v-card-text>
                  <div class="d-flex align-center mb-4">
                    <v-avatar size="48" class="mr-4">
                      <v-img :src="appointment.doctor.avatar"></v-img>
                    </v-avatar>
                    <div>
                      <h3 class="text-h6 mb-1">
                        {{ appointment.doctor.firstName }} {{ appointment.doctor.lastName }}
                      </h3>
                      <p class="text-subtitle-2 text-medium-emphasis">
                        {{ appointment.doctor.specialization }}
                      </p>
                    </div>
                  </div>
                  
                  <v-divider class="mb-4"></v-divider>
                  
                  <div class="mb-4">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="mr-2">mdi-calendar</v-icon>
                      <span>{{ formatDate(appointment.dateTime) }}</span>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="mr-2">mdi-clock</v-icon>
                      <span>{{ formatTime(appointment.dateTime) }}</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon color="primary" class="mr-2">mdi-currency-rub</v-icon>
                      <span>{{ formatPrice(appointment.price) }}</span>
                    </div>
                  </div>
                  
                  <v-divider class="mb-4"></v-divider>
                  
                  <div class="d-flex align-center justify-space-between">
                    <v-chip
                      :color="getStatusColor(appointment.status)"
                      size="small"
                    >
                      {{ getStatusText(appointment.status) }}
                    </v-chip>
                    
                    <v-btn
                      color="primary"
                      variant="text"
                      size="small"
                      @click="rescheduleAppointment(appointment.id)"
                    >
                      Записаться снова
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </v-container>
    
    <!-- Диалог отмены записи -->
    <v-dialog v-model="cancelDialog" max-width="400">
      <v-card>
        <v-card-title>Отменить запись?</v-card-title>
        <v-card-text>
          Вы уверены, что хотите отменить запись? Это действие нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="cancelDialog = false"
          >
            Нет
          </v-btn>
          <v-btn
            color="error"
            @click="confirmCancelAppointment"
            :loading="loading"
          >
            Да, отменить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default {
  name: 'AppointmentsView',
  setup() {
    const store = useStore()
    const router = useRouter()
    const activeTab = ref('upcoming')
    const loading = ref(false)
    const cancelDialog = ref(false)
    const appointmentToCancel = ref(null)
    
    const upcomingAppointments = computed(() => {
      return store.state.appointments.list.filter(
        appointment => appointment.status === 'pending' || appointment.status === 'confirmed'
      )
    })
    
    const pastAppointments = computed(() => {
      return store.state.appointments.list.filter(
        appointment => appointment.status === 'completed'
      )
    })
    
    const cancelledAppointments = computed(() => {
      return store.state.appointments.list.filter(
        appointment => appointment.status === 'cancelled'
      )
    })
    
    const formatDate = (date) => {
      return format(new Date(date), 'dd MMMM yyyy', { locale: ru })
    }
    
    const formatTime = (date) => {
      return format(new Date(date), 'HH:mm')
    }
    
    const formatPrice = (price) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(price)
    }
    
    const getStatusColor = (status) => {
      const colors = {
        pending: 'warning',
        confirmed: 'info',
        completed: 'success',
        cancelled: 'error'
      }
      return colors[status] || 'grey'
    }
    
    const getStatusText = (status) => {
      const texts = {
        pending: 'Ожидает подтверждения',
        confirmed: 'Подтверждено',
        completed: 'Завершено',
        cancelled: 'Отменено'
      }
      return texts[status] || status
    }
    
    const cancelAppointment = (id) => {
      appointmentToCancel.value = id
      cancelDialog.value = true
    }
    
    const confirmCancelAppointment = async () => {
      try {
        loading.value = true
        await store.dispatch('appointments/cancel', appointmentToCancel.value)
        cancelDialog.value = false
      } catch (error) {
        console.error('Error cancelling appointment:', error)
      } finally {
        loading.value = false
      }
    }
    
    const startVideoCall = (id) => {
      router.push(`/video/${id}`)
    }
    
    const viewAppointmentDetails = (id) => {
      router.push(`/appointments/${id}`)
    }
    
    const rescheduleAppointment = (id) => {
      router.push(`/doctors/${id}`)
    }
    
    onMounted(async () => {
      try {
        loading.value = true
        await store.dispatch('appointments/fetchAll')
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        loading.value = false
      }
    })
    
    return {
      activeTab,
      loading,
      cancelDialog,
      upcomingAppointments,
      pastAppointments,
      cancelledAppointments,
      formatDate,
      formatTime,
      formatPrice,
      getStatusColor,
      getStatusText,
      cancelAppointment,
      confirmCancelAppointment,
      startVideoCall,
      viewAppointmentDetails,
      rescheduleAppointment
    }
  }
}
</script>

<style scoped>
.appointment-card {
  transition: transform 0.3s;
}

.appointment-card:hover {
  transform: translateY(-5px);
}
</style> 