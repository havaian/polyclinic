<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-tabs
            v-model="activeTab"
            grow
          >
            <v-tab value="login">Вход</v-tab>
            <v-tab value="register">Регистрация</v-tab>
          </v-tabs>

          <v-card-text>
            <v-window v-model="activeTab">
              <!-- Форма входа -->
              <v-window-item value="login">
                <v-form @submit.prevent="handleLogin" ref="loginForm">
                  <v-text-field
                    v-model="loginForm.email"
                    label="Email"
                    type="email"
                    :rules="[v => !!v || 'Email обязателен', v => /.+@.+\..+/.test(v) || 'Некорректный email']"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="loginForm.password"
                    label="Пароль"
                    type="password"
                    :rules="[v => !!v || 'Пароль обязателен', v => v.length >= 6 || 'Минимум 6 символов']"
                    required
                  ></v-text-field>

                  <v-btn
                    color="primary"
                    block
                    type="submit"
                    :loading="loading"
                  >
                    Войти
                  </v-btn>
                </v-form>
              </v-window-item>

              <!-- Форма регистрации -->
              <v-window-item value="register">
                <v-form @submit.prevent="handleRegister" ref="registerForm">
                  <v-text-field
                    v-model="registerForm.firstName"
                    label="Имя"
                    :rules="[v => !!v || 'Имя обязательно']"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="registerForm.lastName"
                    label="Фамилия"
                    :rules="[v => !!v || 'Фамилия обязательна']"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="registerForm.email"
                    label="Email"
                    type="email"
                    :rules="[v => !!v || 'Email обязателен', v => /.+@.+\..+/.test(v) || 'Некорректный email']"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="registerForm.password"
                    label="Пароль"
                    type="password"
                    :rules="[v => !!v || 'Пароль обязателен', v => v.length >= 6 || 'Минимум 6 символов']"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="registerForm.confirmPassword"
                    label="Подтверждение пароля"
                    type="password"
                    :rules="[
                      v => !!v || 'Подтверждение пароля обязательно',
                      v => v === registerForm.password || 'Пароли не совпадают'
                    ]"
                    required
                  ></v-text-field>

                  <v-btn
                    color="primary"
                    block
                    type="submit"
                    :loading="loading"
                  >
                    Зарегистрироваться
                  </v-btn>
                </v-form>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'AuthView',
  setup() {
    const store = useStore()
    const router = useRouter()
    const activeTab = ref('login')
    const loading = ref(false)
    const loginForm = ref(null)
    const registerForm = ref(null)

    const loginData = reactive({
      email: '',
      password: ''
    })

    const registerData = reactive({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    })

    const handleLogin = async () => {
      const { valid } = await loginForm.value.validate()
      if (!valid) return

      try {
        loading.value = true
        await store.dispatch('auth/login', loginData)
        router.push('/')
      } catch (error) {
        console.error('Login error:', error)
      } finally {
        loading.value = false
      }
    }

    const handleRegister = async () => {
      const { valid } = await registerForm.value.validate()
      if (!valid) return

      try {
        loading.value = true
        await store.dispatch('auth/register', registerData)
        router.push('/')
      } catch (error) {
        console.error('Registration error:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      activeTab,
      loading,
      loginForm,
      registerForm,
      loginForm: loginData,
      registerForm: registerData,
      handleLogin,
      handleRegister
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1976D2 0%, #64B5F6 100%);
}

.auth-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style> 