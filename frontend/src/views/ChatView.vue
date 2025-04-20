<template>
  <v-container class="chat-container">
    <v-row>
      <!-- Список чатов -->
      <v-col cols="12" md="4">
        <v-card class="chat-list h-100">
          <v-card-title class="d-flex align-center">
            <span>Чаты</span>
            <v-spacer></v-spacer>
            <v-btn
              icon
              @click="openNewChatDialog"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <v-list>
            <v-list-item
              v-for="chat in chats"
              :key="chat.id"
              :active="currentChat?.id === chat.id"
              @click="selectChat(chat)"
            >
              <template v-slot:prepend>
                <v-avatar color="primary" class="mr-4">
                  <v-img :src="chat.participant.avatar || '/default-avatar.png'"></v-img>
                </v-avatar>
              </template>

              <v-list-item-title>
                {{ chat.participant.firstName }} {{ chat.participant.lastName }}
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ chat.lastMessage?.text || 'Нет сообщений' }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-chip
                  v-if="chat.unreadCount"
                  color="primary"
                  size="small"
                >
                  {{ chat.unreadCount }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Область чата -->
      <v-col cols="12" md="8">
        <v-card class="chat-area h-100" v-if="currentChat">
          <v-card-title class="d-flex align-center">
            <v-avatar color="primary" class="mr-4">
              <v-img :src="currentChat.participant.avatar || '/default-avatar.png'"></v-img>
            </v-avatar>
            <div>
              <div class="text-h6">
                {{ currentChat.participant.firstName }} {{ currentChat.participant.lastName }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ currentChat.participant.specialization }}
              </div>
            </div>
          </v-card-title>

          <v-divider></v-divider>

          <!-- Сообщения -->
          <v-card-text class="messages-container" ref="messagesContainer">
            <div
              v-for="message in currentChat.messages"
              :key="message.id"
              class="message"
              :class="{ 'message--sent': message.isSent }"
            >
              <div class="message-content">
                {{ message.text }}
              </div>
              <div class="message-time">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </v-card-text>

          <!-- Форма отправки сообщения -->
          <v-card-actions class="message-input">
            <v-text-field
              v-model="newMessage"
              placeholder="Введите сообщение..."
              @keyup.enter="sendMessage"
              hide-details
              dense
            ></v-text-field>
            <v-btn
              color="primary"
              icon
              @click="sendMessage"
              :disabled="!newMessage.trim()"
            >
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Заглушка, когда чат не выбран -->
        <v-card class="chat-area h-100 d-flex align-center justify-center" v-else>
          <div class="text-center">
            <v-icon size="64" color="grey">mdi-chat</v-icon>
            <div class="text-h6 mt-4">Выберите чат или создайте новый</div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог создания нового чата -->
    <v-dialog v-model="newChatDialog" max-width="500">
      <v-card>
        <v-card-title>
          Новый чат
        </v-card-title>
        
        <v-card-text>
          <v-autocomplete
            v-model="selectedDoctor"
            :items="doctors"
            item-title="fullName"
            item-value="id"
            label="Выберите врача"
            :loading="loadingDoctors"
            @update:search="searchDoctors"
          ></v-autocomplete>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="newChatDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="createNewChat"
            :loading="loading"
            :disabled="!selectedDoctor"
          >
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'ChatView',
  setup() {
    const store = useStore()
    const router = useRouter()
    const loading = ref(false)
    const loadingDoctors = ref(false)
    const newChatDialog = ref(false)
    const selectedDoctor = ref(null)
    const newMessage = ref('')
    const messagesContainer = ref(null)
    
    const chats = ref([])
    const currentChat = ref(null)
    const doctors = ref([])
    
    let socket = null

    const connectWebSocket = () => {
      // Здесь будет подключение к WebSocket
      // socket = new WebSocket('ws://localhost:3000/ws')
      
      // socket.onmessage = (event) => {
      //   const message = JSON.parse(event.data)
      //   handleIncomingMessage(message)
      // }
    }

    const fetchChats = async () => {
      try {
        loading.value = true
        // Здесь будет запрос к API для получения списка чатов
        // const { data } = await chatService.getChats()
        // chats.value = data
      } catch (error) {
        console.error('Error fetching chats:', error)
      } finally {
        loading.value = false
      }
    }

    const selectChat = (chat) => {
      currentChat.value = chat
      scrollToBottom()
    }

    const searchDoctors = async (query) => {
      if (!query) return
      
      try {
        loadingDoctors.value = true
        // Здесь будет запрос к API для поиска врачей
        // const { data } = await doctorService.search(query)
        // doctors.value = data
      } catch (error) {
        console.error('Error searching doctors:', error)
      } finally {
        loadingDoctors.value = false
      }
    }

    const createNewChat = async () => {
      if (!selectedDoctor.value) return

      try {
        loading.value = true
        // Здесь будет запрос к API для создания нового чата
        // const { data } = await chatService.create(selectedDoctor.value)
        // chats.value.push(data)
        // currentChat.value = data
        newChatDialog.value = false
      } catch (error) {
        console.error('Error creating chat:', error)
      } finally {
        loading.value = false
      }
    }

    const sendMessage = async () => {
      if (!newMessage.value.trim() || !currentChat.value) return

      try {
        // Здесь будет отправка сообщения через WebSocket
        // socket.send(JSON.stringify({
        //   type: 'message',
        //   chatId: currentChat.value.id,
        //   text: newMessage.value
        // }))
        
        newMessage.value = ''
        scrollToBottom()
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }

    const handleIncomingMessage = (message) => {
      if (currentChat.value?.id === message.chatId) {
        currentChat.value.messages.push(message)
        scrollToBottom()
      }
    }

    const scrollToBottom = async () => {
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const openNewChatDialog = () => {
      newChatDialog.value = true
    }

    onMounted(() => {
      fetchChats()
      connectWebSocket()
    })

    onUnmounted(() => {
      if (socket) {
        socket.close()
      }
    })

    return {
      loading,
      loadingDoctors,
      newChatDialog,
      selectedDoctor,
      newMessage,
      messagesContainer,
      chats,
      currentChat,
      doctors,
      selectChat,
      searchDoctors,
      createNewChat,
      sendMessage,
      formatTime,
      openNewChatDialog
    }
  }
}
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 64px);
}

.chat-list,
.chat-area {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.messages-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
}

.message {
  margin-bottom: 16px;
  max-width: 70%;
}

.message--sent {
  margin-left: auto;
}

.message-content {
  padding: 12px;
  border-radius: 12px;
  background-color: #f5f5f5;
}

.message--sent .message-content {
  background-color: var(--v-primary-base);
  color: white;
}

.message-time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 4px;
  text-align: right;
}

.message-input {
  padding: 16px;
  background-color: #f5f5f5;
}
</style> 