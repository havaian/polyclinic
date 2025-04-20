<template>
  <v-container class="video-chat-container">
    <v-row>
      <v-col cols="12">
        <v-card class="video-chat-card">
          <!-- Заголовок -->
          <v-card-title class="d-flex align-center">
            <v-avatar color="primary" class="mr-4">
              <v-img :src="doctor?.avatar || '/default-avatar.png'"></v-img>
            </v-avatar>
            <div>
              <div class="text-h6">
                {{ doctor?.firstName }} {{ doctor?.lastName }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ doctor?.specialization }}
              </div>
            </div>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              @click="endCall"
              :loading="ending"
            >
              Завершить
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <!-- Видео контейнер -->
          <v-card-text class="video-container">
            <div class="video-grid">
              <!-- Видео собеседника -->
              <div class="video-wrapper remote-video">
                <video
                  ref="remoteVideo"
                  autoplay
                  playsinline
                  class="video-element"
                ></video>
                <div class="video-overlay" v-if="!isRemoteVideoActive">
                  <v-icon size="48" color="white">mdi-video-off</v-icon>
                </div>
              </div>

              <!-- Локальное видео -->
              <div class="video-wrapper local-video">
                <video
                  ref="localVideo"
                  autoplay
                  playsinline
                  muted
                  class="video-element"
                ></video>
                <div class="video-overlay" v-if="!isLocalVideoActive">
                  <v-icon size="24" color="white">mdi-video-off</v-icon>
                </div>
              </div>
            </div>
          </v-card-text>

          <!-- Панель управления -->
          <v-card-actions class="control-panel">
            <v-btn
              icon
              :color="isLocalVideoActive ? 'primary' : 'error'"
              @click="toggleLocalVideo"
            >
              <v-icon>{{ isLocalVideoActive ? 'mdi-video' : 'mdi-video-off' }}</v-icon>
            </v-btn>

            <v-btn
              icon
              :color="isLocalAudioActive ? 'primary' : 'error'"
              @click="toggleLocalAudio"
            >
              <v-icon>{{ isLocalAudioActive ? 'mdi-microphone' : 'mdi-microphone-off' }}</v-icon>
            </v-btn>

            <v-btn
              icon
              color="primary"
              @click="toggleScreenShare"
            >
              <v-icon>{{ isScreenSharing ? 'mdi-monitor-share' : 'mdi-monitor' }}</v-icon>
            </v-btn>

            <v-btn
              icon
              color="primary"
              @click="toggleChat"
            >
              <v-icon>mdi-chat</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Чат -->
    <v-dialog v-model="chatVisible" max-width="400">
      <v-card class="chat-dialog">
        <v-card-title class="d-flex align-center">
          <span>Чат</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="chatVisible = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="chat-messages" ref="chatMessages">
          <div
            v-for="message in messages"
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

        <v-card-actions class="chat-input">
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
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'VideoChatView',
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    
    const localVideo = ref(null)
    const remoteVideo = ref(null)
    const chatMessages = ref(null)
    
    const doctor = ref(null)
    const ending = ref(false)
    const chatVisible = ref(false)
    const newMessage = ref('')
    
    const isLocalVideoActive = ref(true)
    const isLocalAudioActive = ref(true)
    const isRemoteVideoActive = ref(true)
    const isScreenSharing = ref(false)
    
    const messages = ref([])
    let peerConnection = null
    let localStream = null
    let screenStream = null

    const initializeMedia = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        
        if (localVideo.value) {
          localVideo.value.srcObject = localStream
        }
        
        // Здесь будет инициализация WebRTC
        // initializePeerConnection()
      } catch (error) {
        console.error('Error accessing media devices:', error)
      }
    }

    const toggleLocalVideo = () => {
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0]
        videoTrack.enabled = !videoTrack.enabled
        isLocalVideoActive.value = videoTrack.enabled
      }
    }

    const toggleLocalAudio = () => {
      if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0]
        audioTrack.enabled = !audioTrack.enabled
        isLocalAudioActive.value = audioTrack.enabled
      }
    }

    const toggleScreenShare = async () => {
      try {
        if (!isScreenSharing.value) {
          screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true
          })
          
          const videoTrack = screenStream.getVideoTracks()[0]
          if (localStream) {
            localStream.removeTrack(localStream.getVideoTracks()[0])
            localStream.addTrack(videoTrack)
          }
          
          videoTrack.onended = () => {
            stopScreenShare()
          }
        } else {
          stopScreenShare()
        }
        
        isScreenSharing.value = !isScreenSharing.value
      } catch (error) {
        console.error('Error sharing screen:', error)
      }
    }

    const stopScreenShare = () => {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
        screenStream = null
      }
      
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0]
        localStream.removeTrack(videoTrack)
        initializeMedia()
      }
    }

    const toggleChat = () => {
      chatVisible.value = !chatVisible.value
      if (chatVisible.value) {
        nextTick(() => {
          scrollToBottom()
        })
      }
    }

    const sendMessage = () => {
      if (!newMessage.value.trim()) return

      const message = {
        id: Date.now(),
        text: newMessage.value,
        timestamp: new Date(),
        isSent: true
      }
      
      messages.value.push(message)
      newMessage.value = ''
      
      // Здесь будет отправка сообщения через WebRTC data channel
      // sendDataChannelMessage(message)
      
      nextTick(() => {
        scrollToBottom()
      })
    }

    const scrollToBottom = () => {
      if (chatMessages.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight
      }
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const endCall = async () => {
      try {
        ending.value = true
        // Здесь будет завершение звонка
        // await store.dispatch('consultations/endConsultation', route.params.id)
        router.push('/appointments')
      } catch (error) {
        console.error('Error ending call:', error)
      } finally {
        ending.value = false
      }
    }

    onMounted(async () => {
      await initializeMedia()
      // Здесь будет загрузка информации о враче
      // const { data } = await store.dispatch('doctors/fetchDoctorById', route.params.doctorId)
      // doctor.value = data
    })

    onUnmounted(() => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
      }
      if (peerConnection) {
        peerConnection.close()
      }
    })

    return {
      doctor,
      ending,
      chatVisible,
      newMessage,
      localVideo,
      remoteVideo,
      chatMessages,
      isLocalVideoActive,
      isLocalAudioActive,
      isRemoteVideoActive,
      isScreenSharing,
      messages,
      toggleLocalVideo,
      toggleLocalAudio,
      toggleScreenShare,
      toggleChat,
      sendMessage,
      formatTime,
      endCall
    }
  }
}
</script>

<style scoped>
.video-chat-container {
  height: calc(100vh - 64px);
}

.video-chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.video-container {
  flex-grow: 1;
  padding: 0;
  background-color: #000;
}

.video-grid {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  gap: 16px;
  padding: 16px;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.local-video {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 200px;
  height: 150px;
  z-index: 1;
}

.control-panel {
  padding: 16px;
  background-color: #f5f5f5;
  justify-content: center;
  gap: 16px;
}

.chat-dialog {
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.chat-messages {
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

.chat-input {
  padding: 16px;
  background-color: #f5f5f5;
}
</style> 