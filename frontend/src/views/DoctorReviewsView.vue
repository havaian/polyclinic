<template>
  <div class="doctor-reviews">
    <v-container>
      <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px;">
        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      </div>
      
      <div v-else-if="error" class="text-center py-8">
        <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
        <h2 class="text-h5 mb-2">Произошла ошибка</h2>
        <p class="text-body-1 text-medium-emphasis mb-4">{{ error }}</p>
        <v-btn color="primary" @click="fetchReviews">Повторить</v-btn>
      </div>
      
      <div v-else class="reviews-content">
        <div class="d-flex align-center mb-6">
          <v-btn icon="mdi-arrow-left" variant="text" class="mr-4" @click="goBack"></v-btn>
          <h1 class="text-h4">Отзывы о враче</h1>
        </div>
        
        <!-- Информация о враче -->
        <v-card class="mb-6" elevation="2">
          <v-card-text class="pa-6">
            <div class="d-flex align-center">
              <v-avatar size="64" class="mr-4">
                <v-img :src="doctor.avatar"></v-img>
              </v-avatar>
              <div>
                <h2 class="text-h5 mb-1">
                  {{ doctor.firstName }} {{ doctor.lastName }}
                </h2>
                <p class="text-subtitle-1 text-medium-emphasis">
                  {{ doctor.specialization }}
                </p>
                <div class="d-flex align-center mt-2">
                  <v-rating
                    :model-value="averageRating"
                    color="amber"
                    density="compact"
                    readonly
                    size="small"
                    class="mr-2"
                  ></v-rating>
                  <span class="text-caption">
                    {{ averageRating.toFixed(1) }} ({{ reviews.length }} отзывов)
                  </span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
        
        <!-- Статистика отзывов -->
        <v-row class="mb-6">
          <v-col cols="12" md="4">
            <v-card elevation="2">
              <v-card-text class="pa-6">
                <div class="text-center">
                  <div class="text-h3 mb-2">{{ averageRating.toFixed(1) }}</div>
                  <v-rating
                    :model-value="averageRating"
                    color="amber"
                    readonly
                    size="large"
                    class="mb-2"
                  ></v-rating>
                  <div class="text-subtitle-1">Средняя оценка</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="8">
            <v-card elevation="2">
              <v-card-text class="pa-6">
                <div class="mb-4">
                  <div class="d-flex align-center mb-2">
                    <span class="text-subtitle-2 mr-4">5 звезд</span>
                    <v-progress-linear
                      :model-value="getRatingPercentage(5)"
                      color="amber"
                      height="8"
                      rounded
                      class="flex-grow-1"
                    ></v-progress-linear>
                    <span class="text-caption ml-4">{{ getRatingCount(5) }}</span>
                  </div>
                  <div class="d-flex align-center mb-2">
                    <span class="text-subtitle-2 mr-4">4 звезды</span>
                    <v-progress-linear
                      :model-value="getRatingPercentage(4)"
                      color="amber"
                      height="8"
                      rounded
                      class="flex-grow-1"
                    ></v-progress-linear>
                    <span class="text-caption ml-4">{{ getRatingCount(4) }}</span>
                  </div>
                  <div class="d-flex align-center mb-2">
                    <span class="text-subtitle-2 mr-4">3 звезды</span>
                    <v-progress-linear
                      :model-value="getRatingPercentage(3)"
                      color="amber"
                      height="8"
                      rounded
                      class="flex-grow-1"
                    ></v-progress-linear>
                    <span class="text-caption ml-4">{{ getRatingCount(3) }}</span>
                  </div>
                  <div class="d-flex align-center mb-2">
                    <span class="text-subtitle-2 mr-4">2 звезды</span>
                    <v-progress-linear
                      :model-value="getRatingPercentage(2)"
                      color="amber"
                      height="8"
                      rounded
                      class="flex-grow-1"
                    ></v-progress-linear>
                    <span class="text-caption ml-4">{{ getRatingCount(2) }}</span>
                  </div>
                  <div class="d-flex align-center">
                    <span class="text-subtitle-2 mr-4">1 звезда</span>
                    <v-progress-linear
                      :model-value="getRatingPercentage(1)"
                      color="amber"
                      height="8"
                      rounded
                      class="flex-grow-1"
                    ></v-progress-linear>
                    <span class="text-caption ml-4">{{ getRatingCount(1) }}</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        
        <!-- Список отзывов -->
        <div class="mb-6">
          <h2 class="text-h5 mb-4">Все отзывы</h2>
          
          <div v-if="reviews.length === 0" class="text-center py-8">
            <v-icon color="grey" size="64" class="mb-4">mdi-comment-text-outline</v-icon>
            <h3 class="text-h6 mb-2">Нет отзывов</h3>
            <p class="text-body-1 text-medium-emphasis">
              У этого врача пока нет отзывов
            </p>
          </div>
          
          <v-card
            v-for="review in reviews"
            :key="review.id"
            class="mb-4"
            elevation="2"
          >
            <v-card-text class="pa-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <div class="d-flex align-center">
                  <v-avatar size="40" class="mr-3">
                    <v-img :src="review.patient.avatar"></v-img>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1">
                      {{ review.patient.firstName }} {{ review.patient.lastName }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatDate(review.createdAt) }}
                    </div>
                  </div>
                </div>
                <v-rating
                  :model-value="review.rating"
                  color="amber"
                  density="compact"
                  readonly
                  size="small"
                ></v-rating>
              </div>
              
              <p class="text-body-1">{{ review.text }}</p>
              
              <div v-if="review.appointment" class="mt-4">
                <div class="text-caption text-medium-emphasis">
                  Консультация: {{ formatDate(review.appointment.dateTime) }}
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
        
        <!-- Пагинация -->
        <div v-if="reviews.length > 0" class="d-flex justify-center">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="7"
            @update:model-value="handlePageChange"
          ></v-pagination>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default {
  name: 'DoctorReviewsView',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const doctorId = computed(() => route.params.id)
    
    const doctor = ref({})
    const reviews = ref([])
    const loading = ref(false)
    const error = ref(null)
    const currentPage = ref(1)
    const totalPages = ref(1)
    const itemsPerPage = 10
    
    const averageRating = computed(() => {
      if (reviews.value.length === 0) return 0
      const sum = reviews.value.reduce((total, review) => total + review.rating, 0)
      return sum / reviews.value.length
    })
    
    const fetchDoctor = async () => {
      try {
        const data = await store.dispatch('doctors/fetchById', doctorId.value)
        doctor.value = data
      } catch (err) {
        console.error('Error fetching doctor:', err)
      }
    }
    
    const fetchReviews = async () => {
      try {
        loading.value = true
        error.value = null
        const data = await store.dispatch('reviews/fetchByDoctorId', {
          doctorId: doctorId.value,
          page: currentPage.value,
          limit: itemsPerPage
        })
        reviews.value = data.items
        totalPages.value = Math.ceil(data.total / itemsPerPage)
      } catch (err) {
        error.value = err.message || 'Не удалось загрузить отзывы'
        console.error('Error fetching reviews:', err)
      } finally {
        loading.value = false
      }
    }
    
    const handlePageChange = (page) => {
      currentPage.value = page
      fetchReviews()
    }
    
    const getRatingCount = (rating) => {
      return reviews.value.filter(review => review.rating === rating).length
    }
    
    const getRatingPercentage = (rating) => {
      const count = getRatingCount(rating)
      return reviews.value.length > 0 ? (count / reviews.value.length) * 100 : 0
    }
    
    const formatDate = (date) => {
      return format(new Date(date), 'dd MMMM yyyy', { locale: ru })
    }
    
    const goBack = () => {
      router.back()
    }
    
    onMounted(() => {
      fetchDoctor()
      fetchReviews()
    })
    
    return {
      doctor,
      reviews,
      loading,
      error,
      currentPage,
      totalPages,
      averageRating,
      fetchReviews,
      handlePageChange,
      getRatingCount,
      getRatingPercentage,
      formatDate,
      goBack
    }
  }
}
</script>

<style scoped>
.reviews-content {
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