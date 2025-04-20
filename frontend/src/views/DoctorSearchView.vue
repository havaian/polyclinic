<template>
  <div class="doctor-search">
    <!-- Фильтры -->
    <v-container class="filters-section py-4">
      <v-card class="mb-4">
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-text-field
                v-model="filters.search"
                label="Поиск по имени или специализации"
                prepend-inner-icon="mdi-magnify"
                clearable
                @update:model-value="handleSearch"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.specialization"
                :items="specializations"
                label="Специализация"
                clearable
                @update:model-value="handleSearch"
              ></v-select>
            </v-col>
            
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.rating"
                :items="ratingOptions"
                label="Рейтинг"
                clearable
                @update:model-value="handleSearch"
              ></v-select>
            </v-col>
            
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="filters.experience"
                :items="experienceOptions"
                label="Опыт работы"
                clearable
                @update:model-value="handleSearch"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
    
    <!-- Список врачей -->
    <v-container>
      <v-row>
        <v-col
          v-for="doctor in doctors"
          :key="doctor.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card class="doctor-card h-100" elevation="2">
            <v-img
              :src="doctor.avatar"
              height="200"
              cover
            ></v-img>
            
            <v-card-text>
              <h3 class="text-h6 mb-1">
                {{ doctor.firstName }} {{ doctor.lastName }}
              </h3>
              <p class="text-subtitle-2 text-medium-emphasis mb-2">
                {{ doctor.specialization }}
              </p>
              <div class="d-flex align-center mb-2">
                <v-rating
                  :model-value="doctor.rating"
                  color="amber"
                  density="compact"
                  readonly
                  size="small"
                  class="mr-2"
                ></v-rating>
                <router-link 
                  :to="{ name: 'DoctorReviews', params: { id: doctor.id }}"
                  class="text-decoration-none"
                >
                  <span class="text-caption text-medium-emphasis">
                    {{ doctor.reviewsCount }} отзывов
                  </span>
                </router-link>
              </div>
              <p class="text-body-2 mb-2">
                {{ doctor.experience }} лет опыта
              </p>
              <p class="text-body-2">
                Консультация: {{ formatPrice(doctor.consultationFee) }}
              </p>
            </v-card-text>
            
            <v-card-actions>
              <v-btn
                color="primary"
                block
                @click="openAppointmentDialog(doctor)"
              >
                Записаться
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Пагинация -->
      <div class="d-flex justify-center mt-8">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          @update:model-value="handlePageChange"
        ></v-pagination>
      </div>
    </v-container>
    
    <!-- Диалог записи на прием -->
    <v-dialog v-model="appointmentDialog" max-width="600">
      <v-card v-if="selectedDoctor">
        <v-card-title>
          Запись на прием к {{ selectedDoctor.firstName }} {{ selectedDoctor.lastName }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="appointmentForm" @submit.prevent="handleAppointmentSubmit">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="appointmentForm.date"
                  label="Дата"
                  type="date"
                  :rules="[v => !!v || 'Выберите дату']"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <v-select
                  v-model="appointmentForm.time"
                  :items="availableTimeSlots"
                  label="Время"
                  :rules="[v => !!v || 'Выберите время']"
                  required
                ></v-select>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="appointmentForm.reason"
                  label="Причина обращения"
                  :rules="[v => !!v || 'Укажите причину обращения']"
                  required
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="appointmentDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="handleAppointmentSubmit"
            :loading="loading"
          >
            Записаться
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'DoctorSearchView',
  setup() {
    const store = useStore()
    const router = useRouter()
    const doctors = ref([])
    const currentPage = ref(1)
    const totalPages = ref(1)
    const loading = ref(false)
    const appointmentDialog = ref(false)
    const selectedDoctor = ref(null)
    
    const filters = reactive({
      search: '',
      specialization: null,
      rating: null,
      experience: null
    })
    
    const appointmentForm = reactive({
      date: '',
      time: '',
      reason: ''
    })
    
    const specializations = [
      'Терапевт',
      'Кардиолог',
      'Невролог',
      'Педиатр',
      'Офтальмолог',
      'Стоматолог',
      'Дерматолог',
      'Гинеколог',
      'Уролог',
      'Эндокринолог'
    ]
    
    const ratingOptions = [
      { title: '4.5 и выше', value: 4.5 },
      { title: '4.0 и выше', value: 4.0 },
      { title: '3.5 и выше', value: 3.5 }
    ]
    
    const experienceOptions = [
      { title: 'Более 15 лет', value: 15 },
      { title: 'Более 10 лет', value: 10 },
      { title: 'Более 5 лет', value: 5 }
    ]
    
    const availableTimeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ]
    
    const fetchDoctors = async () => {
      try {
        loading.value = true
        // Здесь будет запрос к API для получения списка врачей
        // с учетом фильтров и пагинации
        doctors.value = [
          {
            id: 1,
            firstName: 'Александр',
            lastName: 'Иванов',
            specialization: 'Терапевт',
            rating: 4.8,
            reviewsCount: 124,
            experience: 15,
            consultationFee: 2000,
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
          },
          // ... другие врачи
        ]
        totalPages.value = 5 // Пример значения
      } catch (error) {
        console.error('Error fetching doctors:', error)
      } finally {
        loading.value = false
      }
    }
    
    const handleSearch = () => {
      currentPage.value = 1
      fetchDoctors()
    }
    
    const handlePageChange = (page) => {
      currentPage.value = page
      fetchDoctors()
    }
    
    const formatPrice = (price) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(price)
    }
    
    const openAppointmentDialog = (doctor) => {
      selectedDoctor.value = doctor
      appointmentDialog.value = true
    }
    
    const handleAppointmentSubmit = async () => {
      try {
        loading.value = true
        // Здесь будет запрос к API для создания записи
        await store.dispatch('appointments/create', {
          doctorId: selectedDoctor.value.id,
          ...appointmentForm
        })
        appointmentDialog.value = false
        router.push('/appointments')
      } catch (error) {
        console.error('Error creating appointment:', error)
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      fetchDoctors()
    })
    
    return {
      doctors,
      currentPage,
      totalPages,
      loading,
      filters,
      specializations,
      ratingOptions,
      experienceOptions,
      appointmentDialog,
      selectedDoctor,
      appointmentForm,
      availableTimeSlots,
      handleSearch,
      handlePageChange,
      formatPrice,
      openAppointmentDialog,
      handleAppointmentSubmit
    }
  }
}
</script>

<style scoped>
.doctor-card {
  transition: transform 0.3s;
}

.doctor-card:hover {
  transform: translateY(-5px);
}
</style> 