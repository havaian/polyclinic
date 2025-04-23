<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white shadow rounded-lg">
          <!-- Заголовок профиля -->
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Профиль пользователя
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Личная информация и настройки аккаунта
            </p>
          </div>

          <!-- Основная информация -->
          <div class="border-t border-gray-200">
            <dl>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  Полное имя
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ user?.name || 'Не указано' }}
                </dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  Email
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ user?.email || 'Не указано' }}
                </dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  Дата регистрации
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ formatDate(user?.createdAt) }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Кнопки действий -->
          <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="handleEdit"
            >
              Редактировать профиль
            </button>
          </div>
        </div>

        <!-- История приёмов -->
        <div class="mt-6 bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              История приёмов
            </h3>
          </div>
          <div class="border-t border-gray-200">
            <div class="px-4 py-5 sm:p-6">
              <div v-if="appointments.length === 0" class="text-center text-gray-500">
                У вас пока нет записей на приём
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="appointment in appointments"
                  :key="appointment.id"
                  class="border rounded-lg p-4"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="text-lg font-medium text-gray-900">
                        {{ appointment.doctorName }}
                      </h4>
                      <p class="text-sm text-gray-500">
                        {{ formatDate(appointment.date) }}
                      </p>
                    </div>
                    <span
                      :class="{
                        'bg-green-100 text-green-800': appointment.status === 'completed',
                        'bg-yellow-100 text-yellow-800': appointment.status === 'pending',
                        'bg-red-100 text-red-800': appointment.status === 'cancelled'
                      }"
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    >
                      {{ getStatusText(appointment.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import dayjs from 'dayjs'

export default {
  name: 'Profile',
  setup() {
    const store = useStore()
    const user = computed(() => store.state.user)
    const appointments = computed(() => store.state.appointments || [])

    const formatDate = (date) => {
      return date ? dayjs(date).format('DD.MM.YYYY HH:mm') : 'Не указано'
    }

    const getStatusText = (status) => {
      const statusMap = {
        completed: 'Завершён',
        pending: 'Ожидается',
        cancelled: 'Отменён'
      }
      return statusMap[status] || status
    }

    const handleEdit = () => {
      // TODO: Implement edit profile functionality
      console.log('Edit profile clicked')
    }

    return {
      user,
      appointments,
      formatDate,
      getStatusText,
      handleEdit
    }
  }
}
</script> 