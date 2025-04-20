<template>
  <v-container>
    <v-row>
      <!-- Информация о пользователе -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <v-avatar size="150" class="mb-4">
              <v-img :src="user?.avatar || '/default-avatar.png'"></v-img>
            </v-avatar>
            
            <h2 class="text-h5 mb-2">
              {{ user?.firstName }} {{ user?.lastName }}
            </h2>
            
            <p class="text-subtitle-1 text-medium-emphasis mb-2">
              {{ user?.email }}
            </p>
            
            <v-btn
              color="primary"
              variant="outlined"
              @click="openEditDialog"
            >
              Редактировать профиль
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Статистика и информация -->
      <v-col cols="12" md="8">
        <v-row>
          <!-- Статистика -->
          <v-col cols="12" sm="6">
            <v-card>
              <v-card-text>
                <h3 class="text-h6 mb-4">Статистика</h3>
                <v-list>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-calendar-check</v-icon>
                    </template>
                    <v-list-item-title>Записей на прием</v-list-item-title>
                    <template v-slot:append>
                      <span class="text-h6">{{ stats.appointmentsCount }}</span>
                    </template>
                  </v-list-item>
                  
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-credit-card</v-icon>
                    </template>
                    <v-list-item-title>Платежей</v-list-item-title>
                    <template v-slot:append>
                      <span class="text-h6">{{ stats.paymentsCount }}</span>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Последние действия -->
          <v-col cols="12" sm="6">
            <v-card>
              <v-card-text>
                <h3 class="text-h6 mb-4">Последние действия</h3>
                <v-timeline density="compact">
                  <v-timeline-item
                    v-for="activity in recentActivities"
                    :key="activity.id"
                    :dot-color="activity.color"
                    size="small"
                  >
                    <div class="text-caption">{{ activity.date }}</div>
                    <div>{{ activity.text }}</div>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Диалог редактирования профиля -->
    <v-dialog v-model="editDialog" max-width="600">
      <v-card>
        <v-card-title>
          Редактировать профиль
        </v-card-title>
        
        <v-card-text>
          <v-form ref="editForm" @submit.prevent="handleUpdateProfile">
            <v-text-field
              v-model="editForm.firstName"
              label="Имя"
              :rules="[v => !!v || 'Имя обязательно']"
              required
            ></v-text-field>

            <v-text-field
              v-model="editForm.lastName"
              label="Фамилия"
              :rules="[v => !!v || 'Фамилия обязательна']"
              required
            ></v-text-field>

            <v-text-field
              v-model="editForm.email"
              label="Email"
              type="email"
              :rules="[v => !!v || 'Email обязателен', v => /.+@.+\..+/.test(v) || 'Некорректный email']"
              required
            ></v-text-field>

            <v-text-field
              v-model="editForm.phone"
              label="Телефон"
              :rules="[v => !v || /^\+?[0-9]{10,}$/.test(v) || 'Некорректный номер телефона']"
            ></v-text-field>

            <v-file-input
              v-model="editForm.avatar"
              label="Фото профиля"
              accept="image/*"
              prepend-icon="mdi-camera"
            ></v-file-input>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="editDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="handleUpdateProfile"
            :loading="loading"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

export default {
  name: 'ProfileView',
  setup() {
    const store = useStore()
    const route = useRoute()
    const loading = ref(false)
    const editDialog = ref(false)
    const editForm = ref(null)
    
    const user = ref(null)
    const stats = ref({
      appointmentsCount: 0,
      paymentsCount: 0
    })
    const recentActivities = ref([])
    
    const editData = reactive({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      avatar: null
    })

    const fetchUserProfile = async () => {
      try {
        loading.value = true
        const userId = route.params.id || 'me'
        const data = await store.dispatch('auth/getProfile')
        user.value = data
        // Здесь можно добавить загрузку статистики и активности
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        loading.value = false
      }
    }

    const openEditDialog = () => {
      editData.firstName = user.value.firstName
      editData.lastName = user.value.lastName
      editData.email = user.value.email
      editData.phone = user.value.phone
      editDialog.value = true
    }

    const handleUpdateProfile = async () => {
      const { valid } = await editForm.value.validate()
      if (!valid) return

      try {
        loading.value = true
        await store.dispatch('auth/updateProfile', editData)
        editDialog.value = false
        await fetchUserProfile()
      } catch (error) {
        console.error('Error updating profile:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchUserProfile()
    })

    return {
      user,
      stats,
      recentActivities,
      loading,
      editDialog,
      editForm,
      editForm: editData,
      openEditDialog,
      handleUpdateProfile
    }
  }
}
</script> 