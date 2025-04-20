<template>
  <div class="home">
    <!-- Hero секция -->
    <v-container class="hero-section py-16">
      <v-row align="center" justify="center">
        <v-col cols="12" md="6" class="text-center text-md-left">
          <h1 class="text-h2 font-weight-bold mb-4">
            Онлайн-консультации с врачами
          </h1>
          <p class="text-h6 mb-8">
            Получите профессиональную медицинскую консультацию, не выходя из дома
          </p>
          <v-btn
            color="primary"
            size="x-large"
            class="mr-4"
            to="/doctors"
          >
            Найти врача
          </v-btn>
          <v-btn
            variant="outlined"
            size="x-large"
            to="/appointments"
          >
            Мои записи
          </v-btn>
        </v-col>
        
        <v-col cols="12" md="6" class="d-none d-md-flex justify-center">
          <v-img
            src="@/assets/hero-image.svg"
            max-width="500"
            contain
          ></v-img>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Преимущества -->
    <v-container class="features-section py-16">
      <h2 class="text-h3 text-center mb-12">Преимущества сервиса</h2>
      
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card class="feature-card h-100" elevation="2">
            <v-card-text class="text-center">
              <v-icon size="64" color="primary" class="mb-4">mdi-clock-fast</v-icon>
              <h3 class="text-h5 mb-2">Быстрая запись</h3>
              <p>Запишитесь на прием к врачу в любое удобное время</p>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="feature-card h-100" elevation="2">
            <v-card-text class="text-center">
              <v-icon size="64" color="primary" class="mb-4">mdi-video</v-icon>
              <h3 class="text-h5 mb-2">Видеоконсультации</h3>
              <p>Общайтесь с врачом через видеочат</p>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="feature-card h-100" elevation="2">
            <v-card-text class="text-center">
              <v-icon size="64" color="primary" class="mb-4">mdi-file-document</v-icon>
              <h3 class="text-h5 mb-2">Медицинские документы</h3>
              <p>Храните и делитесь медицинскими документами</p>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="feature-card h-100" elevation="2">
            <v-card-text class="text-center">
              <v-icon size="64" color="primary" class="mb-4">mdi-chat</v-icon>
              <h3 class="text-h5 mb-2">Чат с врачом</h3>
              <p>Общайтесь с врачом в текстовом чате</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Популярные врачи -->
    <v-container class="doctors-section py-16">
      <div class="d-flex align-center justify-space-between mb-12">
        <h2 class="text-h3">Популярные врачи</h2>
        <v-btn
          color="primary"
          variant="text"
          to="/doctors"
        >
          Все врачи
          <v-icon end>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
      
      <v-row>
        <v-col
          v-for="doctor in popularDoctors"
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
                  color="warning"
                  density="compact"
                  readonly
                ></v-rating>
                <span class="ml-2 text-caption">
                  ({{ doctor.reviewsCount }} отзывов)
                </span>
              </div>
              <p class="text-body-2">
                {{ doctor.experience }} лет опыта
              </p>
            </v-card-text>
            
            <v-card-actions>
              <v-btn
                color="primary"
                block
                :to="`/doctors/${doctor.id}`"
              >
                Записаться
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Как это работает -->
    <v-container class="how-it-works-section py-16">
      <h2 class="text-h3 text-center mb-12">Как это работает</h2>
      
      <v-row>
        <v-col cols="12" md="4">
          <div class="step-card text-center">
            <div class="step-number mb-4">1</div>
            <h3 class="text-h5 mb-2">Выберите врача</h3>
            <p>Найдите подходящего специалиста по рейтингу и отзывам</p>
          </div>
        </v-col>
        
        <v-col cols="12" md="4">
          <div class="step-card text-center">
            <div class="step-number mb-4">2</div>
            <h3 class="text-h5 mb-2">Запишитесь на прием</h3>
            <p>Выберите удобное время для консультации</p>
          </div>
        </v-col>
        
        <v-col cols="12" md="4">
          <div class="step-card text-center">
            <div class="step-number mb-4">3</div>
            <h3 class="text-h5 mb-2">Получите консультацию</h3>
            <p>Общайтесь с врачом через видеочат или текстовый чат</p>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'HomeView',
  setup() {
    const store = useStore()
    const popularDoctors = ref([])
    
    onMounted(async () => {
      try {
        // Здесь будет запрос к API для получения популярных врачей
        popularDoctors.value = [
          {
            id: 1,
            firstName: 'Александр',
            lastName: 'Иванов',
            specialization: 'Терапевт',
            rating: 4.8,
            reviewsCount: 124,
            experience: 15,
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
          },
          {
            id: 2,
            firstName: 'Елена',
            lastName: 'Петрова',
            specialization: 'Кардиолог',
            rating: 4.9,
            reviewsCount: 98,
            experience: 12,
            avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
          },
          {
            id: 3,
            firstName: 'Дмитрий',
            lastName: 'Смирнов',
            specialization: 'Невролог',
            rating: 4.7,
            reviewsCount: 87,
            experience: 10,
            avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
          },
          {
            id: 4,
            firstName: 'Ольга',
            lastName: 'Козлова',
            specialization: 'Педиатр',
            rating: 4.9,
            reviewsCount: 156,
            experience: 18,
            avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
          }
        ]
      } catch (error) {
        console.error('Error fetching popular doctors:', error)
      }
    })
    
    return {
      popularDoctors
    }
  }
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
  border-radius: 0 0 50px 50px;
}

.feature-card {
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.doctor-card {
  transition: transform 0.3s;
}

.doctor-card:hover {
  transform: translateY(-5px);
}

.step-number {
  width: 60px;
  height: 60px;
  background-color: var(--v-primary-base);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto;
}
</style> 