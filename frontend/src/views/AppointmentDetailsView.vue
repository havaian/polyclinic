<template>
  <div class="appointment-details">
    <v-container>
      <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px;">
        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      </div>
      
      <div v-else-if="error" class="text-center py-8">
        <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
        <h2 class="text-h5 mb-2">Произошла ошибка</h2>
        <p class="text-body-1 text-medium-emphasis mb-4">{{ error }}</p>
        <v-btn color="primary" @click="fetchAppointment">Повторить</v-btn>
      </div>
      
      <div v-else-if="appointment" class="appointment-content">
        <div class="d-flex align-center mb-6">
          <v-btn icon="mdi-arrow-left" variant="text" class="mr-4" @click="goBack"></v-btn>
          <h1 class="text-h4">Детали записи</h1>
        </div>
        
        <v-row>
          <v-col cols="12" md="8">
            <!-- Основная информация -->
            <v-card class="mb-6" elevation="2">
              <v-card-title class="text-h5 py-4 px-6">
                Информация о записи
              </v-card-title>
              
              <v-divider></v-divider>
              
              <v-card-text class="pa-6">
                <div class="d-flex align-center mb-4">
                  <v-chip
                    :color="getStatusColor(appointment.status)"
                    size="large"
                    class="mr-4"
                  >
                    {{ getStatusText(appointment.status) }}
                  </v-chip>
                  <span class="text-subtitle-1">
                    ID записи: #{{ appointment.id }}
                  </span>
                </div>
                
                <v-row>
                  <v-col cols="12" sm="6">
                    <div class="mb-4">
                      <div class="text-subtitle-2 text-medium-emphasis mb-1">Дата и время</div>
                      <div class="d-flex align-center">
                        <v-icon color="primary" class="mr-2">mdi-calendar</v-icon>
                        <span>{{ formatDate(appointment.dateTime) }}</span>
                      </div>
                      <div class="d-flex align-center mt-1">
                        <v-icon color="primary" class="mr-2">mdi-clock</v-icon>
                        <span>{{ formatTime(appointment.dateTime) }}</span>
                      </div>
                    </div>
                  </v-col>
                  
                  <v-col cols="12" sm="6">
                    <div class="mb-4">
                      <div class="text-subtitle-2 text-medium-emphasis mb-1">Стоимость</div>
                      <div class="d-flex align-center">
                        <v-icon color="primary" class="mr-2">mdi-currency-rub</v-icon>
                        <span class="text-h6">{{ formatPrice(appointment.price) }}</span>
                      </div>
                    </div>
                  </v-col>
                </v-row>
                
                <div class="mb-4">
                  <div class="text-subtitle-2 text-medium-emphasis mb-1">Причина обращения</div>
                  <p>{{ appointment.reason || 'Не указана' }}</p>
                </div>
                
                <div v-if="appointment.notes" class="mb-4">
                  <div class="text-subtitle-2 text-medium-emphasis mb-1">Примечания</div>
                  <p>{{ appointment.notes }}</p>
                </div>
              </v-card-text>
            </v-card>
            
            <!-- Информация о враче -->
            <v-card class="mb-6" elevation="2">
              <v-card-title class="text-h5 py-4 px-6">
                Информация о враче
              </v-card-title>
              
              <v-divider></v-divider>
              
              <v-card-text class="pa-6">
                <div class="d-flex align-center mb-4">
                  <v-avatar size="64" class="mr-4">
                    <v-img :src="appointment.doctor.avatar"></v-img>
                  </v-avatar>
                  <div>
                    <h3 class="text-h6 mb-1">
                      {{ appointment.doctor.firstName }} {{ appointment.doctor.lastName }}
                    </h3>
                    <p class="text-subtitle-2 text-medium-emphasis">
                      {{ appointment.doctor.specialization }}
                    </p>
                    <div class="d-flex align-center mt-1">
                      <v-rating
                        :model-value="appointment.doctor.rating"
                        color="amber"
                        density="compact"
                        readonly
                        size="small"
                        class="mr-2"
                      ></v-rating>
                      <span class="text-caption">
                        {{ appointment.doctor.rating }} ({{ appointment.doctor.reviewsCount }} отзывов)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="mb-4">
                  <div class="text-subtitle-2 text-medium-emphasis mb-1">Опыт работы</div>
                  <p>{{ appointment.doctor.experience }} лет</p>
                </div>
                
                <div class="mb-4">
                  <div class="text-subtitle-2 text-medium-emphasis mb-1">Образование</div>
                  <p>{{ appointment.doctor.education || 'Не указано' }}</p>
                </div>
                
                <div>
                  <div class="text-subtitle-2 text-medium-emphasis mb-1">Достижения</div>
                  <p>{{ appointment.doctor.achievements || 'Не указаны' }}</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="4">
            <!-- Действия -->
            <v-card class="mb-6" elevation="2">
              <v-card-title class="text-h5 py-4 px-6">
                Действия
              </v-card-title>
              
              <v-divider></v-divider>
              
              <v-card-text class="pa-6">
                <div class="d-flex flex-column">
                  <v-btn
                    v-if="appointment.status === 'pending'"
                    color="error"
                    variant="outlined"
                    class="mb-3"
                    @click="cancelAppointment"
                    :loading="actionLoading"
                  >
                    Отменить запись
                  </v-btn>
                  
                  <v-btn
                    v-if="appointment.status === 'confirmed'"
                    color="primary"
                    class="mb-3"
                    @click="startVideoCall"
                  >
                    Начать видео-консультацию
                  </v-btn>
                  
                  <v-btn
                    v-if="appointment.status === 'pending' || appointment.status === 'confirmed'"
                    color="info"
                    variant="outlined"
                    class="mb-3"
                    @click="openRescheduleDialog"
                  >
                    Перенести запись
                  </v-btn>
                  
                  <v-btn
                    v-if="appointment.status === 'completed'"
                    color="success"
                    variant="outlined"
                    class="mb-3"
                    @click="openReviewDialog"
                  >
                    Оставить отзыв
                  </v-btn>
                  
                  <v-btn
                    color="primary"
                    variant="outlined"
                    @click="openChat"
                  >
                    Написать врачу
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
            
            <!-- История изменений -->
            <v-card elevation="2">
              <v-card-title class="text-h5 py-4 px-6">
                История изменений
              </v-card-title>
              
              <v-divider></v-divider>
              
              <v-card-text class="pa-6">
                <v-timeline density="compact" align="start">
                  <v-timeline-item
                    v-for="(event, index) in appointment.history"
                    :key="index"
                    :dot-color="getEventColor(event.type)"
                    size="small"
                  >
                    <div class="d-flex justify-space-between">
                      <div>
                        <div class="text-subtitle-2">{{ getEventText(event.type) }}</div>
                        <div class="text-caption text-medium-emphasis">
                          {{ formatDateTime(event.timestamp) }}
                        </div>
                      </div>
                    </div>
                    <div v-if="event.note" class="mt-1 text-body-2">
                      {{ event.note }}
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
      
      <div v-else class="text-center py-8">
        <v-icon color="grey" size="64" class="mb-4">mdi-information</v-icon>
        <h2 class="text-h5 mb-2">Запись не найдена</h2>
        <p class="text-body-1 text-medium-emphasis mb-4">
          Запрошенная запись не существует или была удалена
        </p>
        <v-btn color="primary" @click="goBack">Вернуться к списку</v-btn>
      </div>
    </v-container>
    
    <!-- Диалог переноса записи -->
    <v-dialog v-model="rescheduleDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 py-4 px-6">
          Перенести запись
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-date-picker
            v-model="newDate"
            :min="minDate"
            class="mb-4"
            @update:model-value="fetchAvailableTimeSlots"
          ></v-date-picker>
          
          <v-select
            v-model="newTime"
            :items="availableTimeSlots"
            label="Выберите время"
            :loading="loadingTimeSlots"
            :disabled="!newDate || loadingTimeSlots"
          ></v-select>
        </v-card-text>
        
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="rescheduleDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="rescheduleAppointment"
            :loading="actionLoading"
            :disabled="!newDate || !newTime"
          >
            Перенести
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Диалог отмены записи -->
    <v-dialog v-model="cancelDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5 py-4 px-6">
          Отменить запись?
        </v-card-title>
        
        <v-card-text class="pa-6">
          <p>Вы уверены, что хотите отменить запись? Это действие нельзя отменить.</p>
          <v-textarea
            v-model="cancelReason"
            label="Причина отмены (необязательно)"
            rows="3"
            class="mt-4"
          ></v-textarea>
        </v-card-text>
        
        <v-card-actions class="pa-6">
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
            :loading="actionLoading"
          >
            Да, отменить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Диалог отзыва -->
    <v-dialog v-model="reviewDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5 py-4 px-6">
          Оставить отзыв
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="mb-4">
            <div class="text-subtitle-2 mb-2">Оценка</div>
            <v-rating
              v-model="reviewRating"
              color="amber"
              size="large"
            ></v-rating>
          </div>
          
          <v-textarea
            v-model="reviewText"
            label="Ваш отзыв"
            rows="4"
            :rules="[v => !!v || 'Пожалуйста, оставьте отзыв']"
          ></v-textarea>
        </v-card-text>
        
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="reviewDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="submitReview"
            :loading="actionLoading"
            :disabled="!reviewRating || !reviewText"
          >
            Отправить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { format, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'

export default {
  name: 'AppointmentDetailsView',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const appointmentId = computed(() => route.params.id)
    
    const appointment = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const actionLoading = ref(false)
    
    // Диалоги
    const rescheduleDialog = ref(false)
    const cancelDialog = ref(false)
    const reviewDialog = ref(false)
    
    // Данные для переноса записи
    const newDate = ref(null)
    const newTime = ref(null)
    const availableTimeSlots = ref([])
    const loadingTimeSlots = ref(false)
    
    // Данные для отмены записи
    const cancelReason = ref('')
    
    // Данные для отзыва
    const reviewRating = ref(0)
    const reviewText = ref('')
    
    // Минимальная дата для выбора (завтра)
    const minDate = computed(() => {
      return format(addDays(new Date(), 1), 'yyyy-MM-dd')
    })
    
    const fetchAppointment = async () => {
      try {
        loading.value = true
        error.value = null
        const data = await store.dispatch('appointments/fetchById', appointmentId.value)
        appointment.value = data
      } catch (err) {
        error.value = err.message || 'Не удалось загрузить информацию о записи'
        console.error('Error fetching appointment:', err)
      } finally {
        loading.value = false
      }
    }
    
    const fetchAvailableTimeSlots = async () => {
      if (!newDate.value) return
      
      try {
        loadingTimeSlots.value = true
        const slots = await store.dispatch('appointments/getAvailableTimeSlots', {
          doctorId: appointment.value.doctor.id,
          date: newDate.value
        })
        availableTimeSlots.value = slots
      } catch (err) {
        console.error('Error fetching time slots:', err)
      } finally {
        loadingTimeSlots.value = false
      }
    }
    
    const openRescheduleDialog = () => {
      rescheduleDialog.value = true
    }
    
    const rescheduleAppointment = async () => {
      if (!newDate.value || !newTime.value) return
      
      try {
        actionLoading.value = true
        const dateTime = `${newDate.value}T${newTime.value}`
        await store.dispatch('appointments/reschedule', {
          id: appointmentId.value,
          dateTime
        })
        rescheduleDialog.value = false
        await fetchAppointment()
      } catch (err) {
        console.error('Error rescheduling appointment:', err)
      } finally {
        actionLoading.value = false
      }
    }
    
    const cancelAppointment = () => {
      cancelDialog.value = true
    }
    
    const confirmCancelAppointment = async () => {
      try {
        actionLoading.value = true
        await store.dispatch('appointments/cancel', appointmentId.value)
        cancelDialog.value = false
        await fetchAppointment()
      } catch (err) {
        console.error('Error cancelling appointment:', err)
      } finally {
        actionLoading.value = false
      }
    }
    
    const openReviewDialog = () => {
      reviewDialog.value = true
    }
    
    const submitReview = async () => {
      if (!reviewRating.value || !reviewText.value) return
      
      try {
        actionLoading.value = true
        await store.dispatch('reviews/createForAppointment', {
          appointmentId: appointmentId.value,
          rating: reviewRating.value,
          text: reviewText.value
        })
        reviewDialog.value = false
        await fetchAppointment()
      } catch (err) {
        console.error('Error submitting review:', err)
      } finally {
        actionLoading.value = false
      }
    }
    
    const startVideoCall = () => {
      router.push(`/video/${appointmentId.value}`)
    }
    
    const openChat = () => {
      router.push(`/chat/${appointment.value.doctor.id}`)
    }
    
    const goBack = () => {
      router.push('/appointments')
    }
    
    const formatDate = (date) => {
      return format(new Date(date), 'dd MMMM yyyy', { locale: ru })
    }
    
    const formatTime = (date) => {
      return format(new Date(date), 'HH:mm')
    }
    
    const formatDateTime = (date) => {
      return format(new Date(date), 'dd MMMM yyyy, HH:mm', { locale: ru })
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
    
    const getEventColor = (type) => {
      const colors = {
        created: 'primary',
        confirmed: 'info',
        rescheduled: 'warning',
        cancelled: 'error',
        completed: 'success'
      }
      return colors[type] || 'grey'
    }
    
    const getEventText = (type) => {
      const texts = {
        created: 'Запись создана',
        confirmed: 'Запись подтверждена',
        rescheduled: 'Запись перенесена',
        cancelled: 'Запись отменена',
        completed: 'Консультация завершена'
      }
      return texts[type] || type
    }
    
    onMounted(() => {
      fetchAppointment()
    })
    
    return {
      appointment,
      loading,
      error,
      actionLoading,
      rescheduleDialog,
      cancelDialog,
      reviewDialog,
      newDate,
      newTime,
      availableTimeSlots,
      loadingTimeSlots,
      cancelReason,
      reviewRating,
      reviewText,
      minDate,
      fetchAppointment,
      fetchAvailableTimeSlots,
      openRescheduleDialog,
      rescheduleAppointment,
      cancelAppointment,
      confirmCancelAppointment,
      openReviewDialog,
      submitReview,
      startVideoCall,
      openChat,
      goBack,
      formatDate,
      formatTime,
      formatDateTime,
      formatPrice,
      getStatusColor,
      getStatusText,
      getEventColor,
      getEventText
    }
  }
}
</script>

<style scoped>
.appointment-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 