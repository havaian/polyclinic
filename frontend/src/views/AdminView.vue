<template>
    <div class="admin">
        <v-container fluid>
            <h1 class="text-h4 mb-6">Панель администратора</h1>

            <!-- Вкладки для разных разделов -->
            <v-tabs v-model="activeTab" class="mb-6">
                <v-tab value="dashboard">Дашборд</v-tab>
                <v-tab value="users">Пользователи</v-tab>
                <v-tab value="doctors">Врачи</v-tab>
                <v-tab value="appointments">Записи</v-tab>
                <v-tab value="payments">Платежи</v-tab>
                <v-tab value="specializations">Специализации</v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
                <!-- Дашборд -->
                <v-window-item value="dashboard">
                    <v-row>
                        <!-- Основные показатели -->
                        <v-col cols="12" sm="6" md="3">
                            <v-card class="stat-card">
                                <v-card-text>
                                    <div class="d-flex align-center">
                                        <div class="mr-4">
                                            <v-icon color="primary" size="48">mdi-account-multiple</v-icon>
                                        </div>
                                        <div>
                                            <div class="text-h4">{{ stats.users.total }}</div>
                                            <div class="text-subtitle-2 text-medium-emphasis">Пользователей</div>
                                        </div>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <v-col cols="12" sm="6" md="3">
                            <v-card class="stat-card">
                                <v-card-text>
                                    <div class="d-flex align-center">
                                        <div class="mr-4">
                                            <v-icon color="info" size="48">mdi-calendar-check</v-icon>
                                        </div>
                                        <div>
                                            <div class="text-h4">{{ stats.appointments.total }}</div>
                                            <div class="text-subtitle-2 text-medium-emphasis">Консультаций</div>
                                        </div>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <v-col cols="12" sm="6" md="3">
                            <v-card class="stat-card">
                                <v-card-text>
                                    <div class="d-flex align-center">
                                        <div class="mr-4">
                                            <v-icon color="success" size="48">mdi-cash-multiple</v-icon>
                                        </div>
                                        <div>
                                            <div class="text-h4">{{ formatCurrency(stats.payments.totalRevenue) }}</div>
                                            <div class="text-subtitle-2 text-medium-emphasis">Выручка</div>
                                        </div>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <v-col cols="12" sm="6" md="3">
                            <v-card class="stat-card">
                                <v-card-text>
                                    <div class="d-flex align-center">
                                        <div class="mr-4">
                                            <v-icon color="warning" size="48">mdi-account-tie</v-icon>
                                        </div>
                                        <div>
                                            <div class="text-h4">{{ stats.users.doctors }}</div>
                                            <div class="text-subtitle-2 text-medium-emphasis">Врачей</div>
                                        </div>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <!-- Графики -->
                        <v-col cols="12" md="8">
                            <v-card class="mb-6">
                                <v-card-title>Статистика по месяцам</v-card-title>
                                <v-card-text style="height: 300px;">
                                    <!-- Здесь будет график -->
                                    <div class="d-flex align-center justify-center" style="height: 100%;">
                                        <p class="text-body-1 text-medium-emphasis">График статистики по месяцам</p>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-card class="mb-6">
                                <v-card-title>Распределение специализаций</v-card-title>
                                <v-card-text style="height: 300px;">
                                    <!-- Здесь будет круговая диаграмма -->
                                    <div class="d-flex align-center justify-center" style="height: 100%;">
                                        <p class="text-body-1 text-medium-emphasis">Диаграмма специализаций</p>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <!-- Статистика по записям -->
                        <v-col cols="12">
                            <v-card>
                                <v-card-title>Статистика по записям</v-card-title>
                                <v-card-text>
                                    <v-row>
                                        <v-col cols="12" sm="3">
                                            <div class="text-h6 text-center">{{ stats.appointments.scheduled }}</div>
                                            <div class="text-subtitle-2 text-medium-emphasis text-center">Запланировано
                                            </div>
                                        </v-col>

                                        <v-col cols="12" sm="3">
                                            <div class="text-h6 text-center">{{ stats.appointments.completed }}</div>
                                            <div class="text-subtitle-2 text-medium-emphasis text-center">Завершено
                                            </div>
                                        </v-col>

                                        <v-col cols="12" sm="3">
                                            <div class="text-h6 text-center">{{ stats.appointments.canceled }}</div>
                                            <div class="text-subtitle-2 text-medium-emphasis text-center">Отменено</div>
                                        </v-col>

                                        <v-col cols="12" sm="3">
                                            <div class="text-h6 text-center">{{ stats.appointments.today }}</div>
                                            <div class="text-subtitle-2 text-medium-emphasis text-center">Сегодня</div>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-window-item>

                <!-- Список пользователей -->
                <v-window-item value="users">
                    <v-card>
                        <v-card-title class="d-flex align-center">
                            <span>Список пользователей</span>
                            <v-spacer></v-spacer>
                            <v-text-field v-model="userSearch" append-icon="mdi-magnify" label="Поиск" hide-details
                                density="compact" class="mx-4" style="max-width: 300px"></v-text-field>
                        </v-card-title>

                        <v-data-table :headers="userHeaders" :items="filteredUsers" :loading="loading.users"
                            class="elevation-1">
                            <template v-slot:item.role="{ item }">
                                <v-chip :color="getRoleColor(item.role)" size="small">
                                    {{ getRoleText(item.role) }}
                                </v-chip>
                            </template>

                            <template v-slot:item.isActive="{ item }">
                                <v-chip :color="item.isActive ? 'success' : 'error'" size="small">
                                    {{ item.isActive ? 'Активен' : 'Неактивен' }}
                                </v-chip>
                            </template>

                            <template v-slot:item.createdAt="{ item }">
                                {{ formatDate(item.createdAt) }}
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <v-btn icon size="small" color="primary" @click="viewUser(item)">
                                    <v-icon>mdi-eye</v-icon>
                                </v-btn>

                                <v-btn icon size="small" color="primary" class="mx-1" @click="editUser(item)">
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>

                                <v-btn icon size="small" :color="item.isActive ? 'error' : 'success'"
                                    @click="toggleUserStatus(item)">
                                    <v-icon>{{ item.isActive ? 'mdi-close' : 'mdi-check' }}</v-icon>
                                </v-btn>
                            </template>
                        </v-data-table>
                    </v-card>
                </v-window-item>

                <!-- Список врачей -->
                <v-window-item value="doctors">
                    <v-card>
                        <v-card-title class="d-flex align-center">
                            <span>Список врачей</span>
                            <v-spacer></v-spacer>
                            <v-text-field v-model="doctorSearch" append-icon="mdi-magnify" label="Поиск" hide-details
                                density="compact" class="mx-4" style="max-width: 300px"></v-text-field>
                        </v-card-title>

                        <v-data-table :headers="doctorHeaders" :items="filteredDoctors" :loading="loading.doctors"
                            class="elevation-1">
                            <template v-slot:item.isVerified="{ item }">
                                <v-chip :color="item.isVerified ? 'success' : 'warning'" size="small">
                                    {{ item.isVerified ? 'Подтвержден' : 'Не подтвержден' }}
                                </v-chip>
                            </template>

                            <template v-slot:item.isActive="{ item }">
                                <v-chip :color="item.isActive ? 'success' : 'error'" size="small">
                                    {{ item.isActive ? 'Активен' : 'Неактивен' }}
                                </v-chip>
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <v-btn icon size="small" color="primary" @click="viewDoctor(item)">
                                    <v-icon>mdi-eye</v-icon>
                                </v-btn>

                                <v-btn icon size="small" color="primary" class="mx-1" @click="editDoctor(item)">
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>

                                <v-btn icon size="small" :color="item.isVerified ? 'error' : 'success'"
                                    @click="toggleDoctorVerification(item)">
                                    <v-icon>{{ item.isVerified ? 'mdi-close' : 'mdi-check' }}</v-icon>
                                </v-btn>
                            </template>
                        </v-data-table>
                    </v-card>
                </v-window-item>

                <!-- Список записей -->
                <v-window-item value="appointments">
                    <v-card>
                        <v-card-title class="d-flex align-center">
                            <span>Список записей</span>
                            <v-spacer></v-spacer>
                            <v-select v-model="appointmentStatus" :items="statusOptions" label="Статус" hide-details
                                density="compact" class="mx-2" style="max-width: 200px"></v-select>
                            <v-text-field v-model="appointmentSearch" append-icon="mdi-magnify" label="Поиск"
                                hide-details density="compact" class="mx-2" style="max-width: 200px"></v-text-field>
                        </v-card-title>

                        <v-data-table :headers="appointmentHeaders" :items="filteredAppointments"
                            :loading="loading.appointments" class="elevation-1">
                            <template v-slot:item.status="{ item }">
                                <v-chip :color="getStatusColor(item.status)" size="small">
                                    {{ getStatusText(item.status) }}
                                </v-chip>
                            </template>

                            <template v-slot:item.dateTime="{ item }">
                                {{ formatDateTime(item.dateTime) }}
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <v-btn icon size="small" color="primary" @click="viewAppointment(item)">
                                    <v-icon>mdi-eye</v-icon>
                                </v-btn>

                                <v-btn icon size="small" color="primary" class="mx-1" @click="editAppointment(item)">
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>
                            </template>
                        </v-data-table>
                    </v-card>
                </v-window-item>

                <!-- Список платежей -->
                <v-window-item value="payments">
                    <v-card>
                        <v-card-title class="d-flex align-center">
                            <span>Список платежей</span>
                            <v-spacer></v-spacer>
                            <v-select v-model="paymentStatus" :items="paymentStatusOptions" label="Статус" hide-details
                                density="compact" class="mx-2" style="max-width: 200px"></v-select>
                            <v-text-field v-model="paymentSearch" append-icon="mdi-magnify" label="Поиск" hide-details
                                density="compact" class="mx-2" style="max-width: 200px"></v-text-field>
                        </v-card-title>

                        <v-data-table :headers="paymentHeaders" :items="filteredPayments" :loading="loading.payments"
                            class="elevation-1">
                            <template v-slot:item.status="{ item }">
                                <v-chip :color="getPaymentStatusColor(item.status)" size="small">
                                    {{ getPaymentStatusText(item.status) }}
                                </v-chip>
                            </template>

                            <template v-slot:item.amount="{ item }">
                                {{ formatCurrency(item.amount) }}
                            </template>

                            <template v-slot:item.createdAt="{ item }">
                                {{ formatDateTime(item.createdAt) }}
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <v-btn icon size="small" color="primary" @click="viewPayment(item)">
                                    <v-icon>mdi-eye</v-icon>
                                </v-btn>

                                <v-btn icon size="small" color="success" class="mx-1" v-if="item.status === 'pending'"
                                    @click="markPaymentCompleted(item)">
                                    <v-icon>mdi-check</v-icon>
                                </v-btn>
                            </template>
                        </v-data-table>
                    </v-card>
                </v-window-item>

                <!-- Список специализаций -->
                <v-window-item value="specializations">
                    <v-row>
                        <v-col cols="12" md="4">
                            <v-card>
                                <v-card-title>
                                    {{ editingSpecialization ? 'Редактировать специализацию' : 'Добавить специализацию'
                                    }}
                                </v-card-title>

                                <v-card-text>
                                    <v-form ref="specializationForm">
                                        <v-text-field v-model="specializationForm.name" label="Название"
                                            :rules="[v => !!v || 'Название обязательно']" required></v-text-field>

                                        <v-textarea v-model="specializationForm.description" label="Описание"
                                            rows="3"></v-textarea>

                                        <v-text-field v-model="specializationForm.icon" label="Иконка"
                                            hint="Например: mdi-stethoscope"></v-text-field>

                                        <v-switch v-model="specializationForm.isActive" label="Активна" color="primary"
                                            hide-details class="mt-4"></v-switch>
                                    </v-form>
                                </v-card-text>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn v-if="editingSpecialization" color="grey" variant="text"
                                        @click="cancelEditSpecialization">
                                        Отмена
                                    </v-btn>
                                    <v-btn color="primary" @click="saveSpecialization"
                                        :loading="loading.specialization">
                                        {{ editingSpecialization ? 'Сохранить' : 'Добавить' }}
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="8">
                            <v-card>
                                <v-card-title class="d-flex align-center">
                                    <span>Список специализаций</span>
                                    <v-spacer></v-spacer>
                                    <v-text-field v-model="specializationSearch" append-icon="mdi-magnify" label="Поиск"
                                        hide-details density="compact" class="mx-4"
                                        style="max-width: 300px"></v-text-field>
                                </v-card-title>

                                <v-data-table :headers="specializationHeaders" :items="filteredSpecializations"
                                    :loading="loading.specializations" class="elevation-1">
                                    <template v-slot:item.isActive="{ item }">
                                        <v-chip :color="item.isActive ? 'success' : 'error'" size="small">
                                            {{ item.isActive ? 'Активна' : 'Неактивна' }}
                                        </v-chip>
                                    </template>

                                    <template v-slot:item.icon="{ item }">
                                        <v-icon>{{ item.icon }}</v-icon>
                                    </template>

                                    <template v-slot:item.actions="{ item }">
                                        <v-btn icon size="small" color="primary" @click="editSpecialization(item)">
                                            <v-icon>mdi-pencil</v-icon>
                                        </v-btn>

                                        <v-btn icon size="small" color="error" class="mx-1"
                                            @click="confirmDeleteSpecialization(item)">
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                    </template>
                                </v-data-table>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-window-item>
            </v-window>
        </v-container>

        <!-- Диалоги для редактирования -->
        <v-dialog v-model="userDialog" max-width="600">
            <v-card v-if="selectedUser">
                <v-card-title>
                    Редактирование пользователя
                </v-card-title>

                <v-card-text>
                    <v-form ref="userForm">
                        <v-text-field v-model="userForm.firstName" label="Имя" :rules="[v => !!v || 'Имя обязательно']"
                            required></v-text-field>

                        <v-text-field v-model="userForm.lastName" label="Фамилия"
                            :rules="[v => !!v || 'Фамилия обязательна']" required></v-text-field>

                        <v-text-field v-model="userForm.email" label="Email"
                            :rules="[v => !!v || 'Email обязателен', v => /.+@.+\..+/.test(v) || 'Неверный формат email']"
                            required></v-text-field>

                        <v-text-field v-model="userForm.phone" label="Телефон"></v-text-field>

                        <v-select v-model="userForm.role" :items="roleOptions" label="Роль"
                            :rules="[v => !!v || 'Роль обязательна']" required></v-select>

                        <v-switch v-model="userForm.isActive" label="Активен" color="primary" hide-details
                            class="mt-4"></v-switch>

                        <v-switch v-model="userForm.isVerified" label="Подтвержден" color="primary" hide-details
                            class="mt-4"></v-switch>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" variant="text" @click="userDialog = false">
                        Отмена
                    </v-btn>
                    <v-btn color="primary" @click="saveUser" :loading="loading.userForm">
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Диалог подтверждения удаления -->
        <v-dialog v-model="deleteDialog" max-width="400">
            <v-card>
                <v-card-title>
                    Удалить специализацию?
                </v-card-title>

                <v-card-text>
                    Вы уверены, что хотите удалить специализацию "{{ selectedSpecialization?.name }}"? Это действие
                    нельзя
                    отменить.
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" variant="text" @click="deleteDialog = false">
                        Отмена
                    </v-btn>
                    <v-btn color="error" @click="deleteSpecialization" :loading="loading.delete">
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default {
    name: 'AdminView',
    setup() {
        const store = useStore()
        const activeTab = ref('dashboard')

        // Состояния загрузки
        const loading = reactive({
            users: false,
            doctors: false,
            appointments: false,
            payments: false,
            specializations: false,
            userForm: false,
            specialization: false,
            delete: false
        })

        // Данные статистики
        const stats = reactive({
            users: {
                total: 150,
                patients: 120,
                doctors: 30,
                newToday: 5
            },
            appointments: {
                total: 320,
                scheduled: 45,
                completed: 250,
                canceled: 25,
                today: 12
            },
            payments: {
                total: 280,
                successful: 270,
                successRate: 96.4,
                totalRevenue: 540000
            }
        })

        // Пользователи
        const users = ref([])
        const userSearch = ref('')
        const userDialog = ref(false)
        const selectedUser = ref(null)
        const userForm = reactive({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            role: '',
            isActive: true,
            isVerified: true
        })

        const userHeaders = [
            { title: 'ID', key: 'id' },
            { title: 'Имя', key: 'firstName' },
            { title: 'Фамилия', key: 'lastName' },
            { title: 'Email', key: 'email' },
            { title: 'Роль', key: 'role' },
            { title: 'Статус', key: 'isActive' },
            { title: 'Дата регистрации', key: 'createdAt' },
            { title: 'Действия', key: 'actions', sortable: false }
        ]

        const roleOptions = [
            { title: 'Пациент', value: 'patient' },
            { title: 'Врач', value: 'doctor' },
            { title: 'Администратор', value: 'admin' }
        ]

        // Врачи
        const doctors = ref([])
        const doctorSearch = ref('')

        const doctorHeaders = [
            { title: 'ID', key: 'id' },
            { title: 'Имя', key: 'firstName' },
            { title: 'Фамилия', key: 'lastName' },
            { title: 'Специализация', key: 'specialization' },
            { title: 'Опыт', key: 'experience' },
            { title: 'Верификация', key: 'isVerified' },
            { title: 'Статус', key: 'isActive' },
            { title: 'Действия', key: 'actions', sortable: false }
        ]

        // Записи
        const appointments = ref([])
        const appointmentSearch = ref('')
        const appointmentStatus = ref('')

        const appointmentHeaders = [
            { title: 'ID', key: 'id' },
            { title: 'Пациент', key: 'patientName' },
            { title: 'Врач', key: 'doctorName' },
            { title: 'Дата и время', key: 'dateTime' },
            { title: 'Тип', key: 'type' },
            { title: 'Статус', key: 'status' },
            { title: 'Действия', key: 'actions', sortable: false }
        ]

        const statusOptions = [
            { title: 'Все', value: '' },
            { title: 'Запланировано', value: 'scheduled' },
            { title: 'Завершено', value: 'completed' },
            { title: 'Отменено', value: 'canceled' },
            { title: 'Неявка', value: 'no-show' }
        ]

        // Платежи
        const payments = ref([])
        const paymentSearch = ref('')
        const paymentStatus = ref('')

        const paymentHeaders = [
            { title: 'ID', key: 'id' },
            { title: 'Пациент', key: 'patientName' },
            { title: 'Врач', key: 'doctorName' },
            { title: 'Сумма', key: 'amount' },
            { title: 'Статус', key: 'status' },
            { title: 'Дата', key: 'createdAt' },
            { title: 'Действия', key: 'actions', sortable: false }
        ]

        const paymentStatusOptions = [
            { title: 'Все', value: '' },
            { title: 'В ожидании', value: 'pending' },
            { title: 'Успешно', value: 'succeeded' },
            { title: 'Отменено', value: 'canceled' },
            { title: 'Ошибка', value: 'failed' }
        ]

        // Специализации
        const specializations = ref([])
        const specializationSearch = ref('')
        const editingSpecialization = ref(false)
        const selectedSpecialization = ref(null)
        const deleteDialog = ref(false)

        const specializationForm = reactive({
            name: '',
            description: '',
            icon: 'mdi-stethoscope',
            isActive: true
        })

        const specializationHeaders = [
            { title: 'ID', key: 'id' },
            { title: 'Название', key: 'name' },
            { title: 'Описание', key: 'description' },
            { title: 'Иконка', key: 'icon' },
            { title: 'Статус', key: 'isActive' },
            { title: 'Действия', key: 'actions', sortable: false }
        ]

        // Фильтрованные данные
        const filteredUsers = computed(() => {
            if (!userSearch.value) return users.value

            const searchLower = userSearch.value.toLowerCase()
            return users.value.filter(user =>
                user.firstName.toLowerCase().includes(searchLower) ||
                user.lastName.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower)
            )
        })

        const filteredDoctors = computed(() => {
            if (!doctorSearch.value) return doctors.value

            const searchLower = doctorSearch.value.toLowerCase()
            return doctors.value.filter(doctor =>
                doctor.firstName.toLowerCase().includes(searchLower) ||
                doctor.lastName.toLowerCase().includes(searchLower) ||
                doctor.specialization.toLowerCase().includes(searchLower)
            )
        })

        const filteredAppointments = computed(() => {
            let result = appointments.value

            if (appointmentSearch.value) {
                const searchLower = appointmentSearch.value.toLowerCase()
                result = result.filter(appointment =>
                    appointment.patientName.toLowerCase().includes(searchLower) ||
                    appointment.doctorName.toLowerCase().includes(searchLower)
                )
            }

            if (appointmentStatus.value) {
                result = result.filter(appointment => appointment.status === appointmentStatus.value)
            }

            return result
        })

        const filteredPayments = computed(() => {
            let result = payments.value

            if (paymentSearch.value) {
                const searchLower = paymentSearch.value.toLowerCase()
                result = result.filter(payment =>
                    payment.patientName.toLowerCase().includes(searchLower) ||
                    payment.doctorName.toLowerCase().includes(searchLower)
                )
            }

            if (paymentStatus.value) {
                result = result.filter(payment => payment.status === paymentStatus.value)
            }

            return result
        })

        const filteredSpecializations = computed(() => {
            if (!specializationSearch.value) return specializations.value

            const searchLower = specializationSearch.value.toLowerCase()
            return specializations.value.filter(spec =>
                spec.name.toLowerCase().includes(searchLower) ||
                spec.description.toLowerCase().includes(searchLower)
            )
        })

        // Форматирование и вспомогательные функции
        const formatDate = (dateString) => {
            if (!dateString) return 'Н/Д'
            return format(new Date(dateString), 'd MMMM yyyy', { locale: ru })
        }

        const formatDateTime = (dateString) => {
            if (!dateString) return 'Н/Д'
            return format(new Date(dateString), 'd MMMM yyyy, HH:mm', { locale: ru })
        }

        const formatCurrency = (amount) => {
            if (!amount && amount !== 0) return '0 ₽'
            return new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB'
            }).format(amount)
        }

        const getRoleColor = (role) => {
            const colors = {
                'patient': 'info',
                'doctor': 'success',
                'admin': 'error'
            }
            return colors[role] || 'grey'
        }

        const getRoleText = (role) => {
            const texts = {
                'patient': 'Пациент',
                'doctor': 'Врач',
                'admin': 'Админ'
            }
            return texts[role] || role
        }

        const getStatusColor = (status) => {
            const colors = {
                'scheduled': 'warning',
                'completed': 'success',
                'canceled': 'error',
                'no-show': 'grey'
            }
            return colors[status] || 'grey'
        }

        const getStatusText = (status) => {
            const texts = {
                'scheduled': 'Запланировано',
                'completed': 'Завершено',
                'canceled': 'Отменено',
                'no-show': 'Неявка'
            }
            return texts[status] || status
        }

        const getPaymentStatusColor = (status) => {
            const colors = {
                'pending': 'warning',
                'succeeded': 'success',
                'failed': 'error',
                'canceled': 'grey'
            }
            return colors[status] || 'grey'
        }

        const getPaymentStatusText = (status) => {
            const texts = {
                'pending': 'В ожидании',
                'succeeded': 'Успешно',
                'failed': 'Ошибка',
                'canceled': 'Отменено'
            }
            return texts[status] || status
        }

        // Функции для работы с пользователями
        const viewUser = (user) => {
            // Переход на страницу просмотра пользователя
            console.log('View user:', user)
        }

        const editUser = (user) => {
            selectedUser.value = user
            // Заполнение формы данными пользователя
            userForm.firstName = user.firstName
            userForm.lastName = user.lastName
            userForm.email = user.email
            userForm.phone = user.phone || ''
            userForm.role = user.role
            userForm.isActive = user.isActive
            userForm.isVerified = user.isVerified

            userDialog.value = true
        }

        const saveUser = async () => {
            // Валидация формы
            const { valid } = await userForm.value.validate()
            if (!valid) return

            try {
                loading.userForm = true

                // Обновление пользователя
                // await store.dispatch('admin/updateUser', {
                //   id: selectedUser.value.id,
                //   ...userForm
                // })

                userDialog.value = false
                // Перезагрузка списка пользователей
                fetchUsers()
            } catch (error) {
                console.error('Error saving user:', error)
            } finally {
                loading.userForm = false
            }
        }

        const toggleUserStatus = async (user) => {
            try {
                // Изменение статуса пользователя
                // await store.dispatch('admin/toggleUserStatus', {
                //   id: user.id,
                //   isActive: !user.isActive
                // })

                // Перезагрузка списка пользователей
                fetchUsers()
            } catch (error) {
                console.error('Error toggling user status:', error)
            }
        }

        // Функции для работы с врачами
        const viewDoctor = (doctor) => {
            // Переход на страницу просмотра врача
            console.log('View doctor:', doctor)
        }

        const editDoctor = (doctor) => {
            // Редактирование врача
            console.log('Edit doctor:', doctor)
        }

        const toggleDoctorVerification = async (doctor) => {
            try {
                // Изменение статуса верификации врача
                // await store.dispatch('admin/toggleDoctorVerification', {
                //   id: doctor.id,
                //   isVerified: !doctor.isVerified
                // })

                // Перезагрузка списка врачей
                fetchDoctors()
            } catch (error) {
                console.error('Error toggling doctor verification:', error)
            }
        }

        // Функции для работы с записями
        const viewAppointment = (appointment) => {
            // Переход на страницу просмотра записи
            console.log('View appointment:', appointment)
        }

        const editAppointment = (appointment) => {
            // Редактирование записи
            console.log('Edit appointment:', appointment)
        }

        // Функции для работы с платежами
        const viewPayment = (payment) => {
            // Переход на страницу просмотра платежа
            console.log('View payment:', payment)
        }

        const markPaymentCompleted = async (payment) => {
            try {
                // Отметка платежа как выполненного
                // await store.dispatch('admin/markPaymentCompleted', payment.id)

                // Перезагрузка списка платежей
                fetchPayments()
            } catch (error) {
                console.error('Error marking payment as completed:', error)
            }
        }

        // Функции для работы со специализациями
        const editSpecialization = (specialization) => {
            selectedSpecialization.value = specialization
            editingSpecialization.value = true

            // Заполнение формы данными специализации
            specializationForm.name = specialization.name
            specializationForm.description = specialization.description || ''
            specializationForm.icon = specialization.icon || 'mdi-stethoscope'
            specializationForm.isActive = specialization.isActive
        }

        const cancelEditSpecialization = () => {
            editingSpecialization.value = false
            selectedSpecialization.value = null

            // Сброс формы
            specializationForm.name = ''
            specializationForm.description = ''
            specializationForm.icon = 'mdi-stethoscope'
            specializationForm.isActive = true
        }

        const saveSpecialization = async () => {
            try {
                loading.specialization = true

                if (editingSpecialization.value) {
                    // Обновление существующей специализации
                    // await store.dispatch('admin/updateSpecialization', {
                    //   id: selectedSpecialization.value.id,
                    //   ...specializationForm
                    // })
                } else {
                    // Создание новой специализации
                    // await store.dispatch('admin/createSpecialization', specializationForm)
                }

                // Сброс формы
                specializationForm.name = ''
                specializationForm.description = ''
                specializationForm.icon = 'mdi-stethoscope'
                specializationForm.isActive = true

                editingSpecialization.value = false
                selectedSpecialization.value = null

                // Перезагрузка списка специализаций
                fetchSpecializations()
            } catch (error) {
                console.error('Error saving specialization:', error)
            } finally {
                loading.specialization = false
            }
        }

        const confirmDeleteSpecialization = (specialization) => {
            selectedSpecialization.value = specialization
            deleteDialog.value = true
        }

        const deleteSpecialization = async () => {
            try {
                loading.delete = true

                // Удаление специализации
                // await store.dispatch('admin/deleteSpecialization', selectedSpecialization.value.id)

                deleteDialog.value = false

                // Перезагрузка списка специализаций
                fetchSpecializations()
            } catch (error) {
                console.error('Error deleting specialization:', error)
            } finally {
                loading.delete = false
            }
        }

        // Получение данных
        const fetchDashboardStats = async () => {
            try {
                // Получение статистики для дашборда
                // const data = await store.dispatch('admin/getDashboardStats')
                // Object.assign(stats, data)
            } catch (error) {
                console.error('Error fetching dashboard stats:', error)
            }
        }

        const fetchUsers = async () => {
            try {
                loading.users = true

                // Получение списка пользователей
                // const data = await store.dispatch('admin/getUsers')
                // users.value = data

                // Имитация данных для демонстрации
                users.value = [
                    {
                        id: 1,
                        firstName: 'Иван',
                        lastName: 'Иванов',
                        email: 'ivan@example.com',
                        phone: '+7 (999) 123-45-67',
                        role: 'patient',
                        isActive: true,
                        isVerified: true,
                        createdAt: new Date(2023, 0, 15)
                    },
                    {
                        id: 2,
                        firstName: 'Александр',
                        lastName: 'Петров',
                        email: 'alex@example.com',
                        phone: '+7 (999) 987-65-43',
                        role: 'doctor',
                        isActive: true,
                        isVerified: true,
                        createdAt: new Date(2023, 1, 20)
                    },
                    {
                        id: 3,
                        firstName: 'Елена',
                        lastName: 'Сидорова',
                        email: 'elena@example.com',
                        phone: '+7 (999) 456-78-90',
                        role: 'admin',
                        isActive: true,
                        isVerified: true,
                        createdAt: new Date(2023, 2, 10)
                    }
                ]
            } catch (error) {
                console.error('Error fetching users:', error)
            } finally {
                loading.users = false
            }
        }

        const fetchDoctors = async () => {
            try {
                loading.doctors = true

                // Получение списка врачей
                // const data = await store.dispatch('admin/getDoctors')
                // doctors.value = data

                // Имитация данных для демонстрации
                doctors.value = [
                    {
                        id: 1,
                        firstName: 'Александр',
                        lastName: 'Петров',
                        specialization: 'Терапевт',
                        experience: 10,
                        isVerified: true,
                        isActive: true
                    },
                    {
                        id: 2,
                        firstName: 'Ольга',
                        lastName: 'Иванова',
                        specialization: 'Кардиолог',
                        experience: 15,
                        isVerified: true,
                        isActive: true
                    },
                    {
                        id: 3,
                        firstName: 'Дмитрий',
                        lastName: 'Смирнов',
                        specialization: 'Невролог',
                        experience: 8,
                        isVerified: false,
                        isActive: true
                    }
                ]
            } catch (error) {
                console.error('Error fetching doctors:', error)
            } finally {
                loading.doctors = false
            }
        }

        const fetchAppointments = async () => {
            try {
                loading.appointments = true

                // Получение списка записей
                // const data = await store.dispatch('admin/getAppointments')
                // appointments.value = data

                // Имитация данных для демонстрации
                appointments.value = [
                    {
                        id: 1,
                        patientName: 'Иван Иванов',
                        doctorName: 'Александр Петров',
                        dateTime: new Date(2023, 3, 15, 10, 0),
                        type: 'video',
                        status: 'scheduled'
                    },
                    {
                        id: 2,
                        patientName: 'Мария Сидорова',
                        doctorName: 'Ольга Иванова',
                        dateTime: new Date(2023, 3, 10, 15, 30),
                        type: 'chat',
                        status: 'completed'
                    },
                    {
                        id: 3,
                        patientName: 'Петр Смирнов',
                        doctorName: 'Дмитрий Смирнов',
                        dateTime: new Date(2023, 3, 5, 12, 0),
                        type: 'video',
                        status: 'canceled'
                    }
                ]
            } catch (error) {
                console.error('Error fetching appointments:', error)
            } finally {
                loading.appointments = false
            }
        }

        const fetchPayments = async () => {
            try {
                loading.payments = true

                // Получение списка платежей
                // const data = await store.dispatch('admin/getPayments')
                // payments.value = data

                // Имитация данных для демонстрации
                payments.value = [
                    {
                        id: 'PAY-123456',
                        patientName: 'Иван Иванов',
                        doctorName: 'Александр Петров',
                        amount: 2000,
                        status: 'succeeded',
                        createdAt: new Date(2023, 3, 15)
                    },
                    {
                        id: 'PAY-234567',
                        patientName: 'Мария Сидорова',
                        doctorName: 'Ольга Иванова',
                        amount: 2500,
                        status: 'pending',
                        createdAt: new Date(2023, 3, 16)
                    },
                    {
                        id: 'PAY-345678',
                        patientName: 'Петр Смирнов',
                        doctorName: 'Дмитрий Смирнов',
                        amount: 1800,
                        status: 'failed',
                        createdAt: new Date(2023, 3, 17)
                    }
                ]
            } catch (error) {
                console.error('Error fetching payments:', error)
            } finally {
                loading.payments = false
            }
        }

        const fetchSpecializations = async () => {
            try {
                loading.specializations = true

                // Получение списка специализаций
                // const data = await store.dispatch('admin/getSpecializations')
                // specializations.value = data

                // Имитация данных для демонстрации
                specializations.value = [
                    {
                        id: 1,
                        name: 'Терапевт',
                        description: 'Лечение общих заболеваний',
                        icon: 'mdi-stethoscope',
                        isActive: true
                    },
                    {
                        id: 2,
                        name: 'Кардиолог',
                        description: 'Лечение заболеваний сердечно-сосудистой системы',
                        icon: 'mdi-heart-pulse',
                        isActive: true
                    },
                    {
                        id: 3,
                        name: 'Невролог',
                        description: 'Лечение заболеваний нервной системы',
                        icon: 'mdi-brain',
                        isActive: true
                    }
                ]
            } catch (error) {
                console.error('Error fetching specializations:', error)
            } finally {
                loading.specializations = false
            }
        }

        onMounted(() => {
            fetchDashboardStats()
            fetchUsers()
            fetchDoctors()
            fetchAppointments()
            fetchPayments()
            fetchSpecializations()
        })

        return {
            activeTab,
            loading,
            stats,

            // Пользователи
            users,
            userSearch,
            userDialog,
            selectedUser,
            userForm,
            userHeaders,
            roleOptions,
            filteredUsers,

            // Врачи
            doctors,
            doctorSearch,
            doctorHeaders,
            filteredDoctors,

            // Записи
            appointments,
            appointmentSearch,
            appointmentStatus,
            appointmentHeaders,
            statusOptions,
            filteredAppointments,

            // Платежи
            payments,
            paymentSearch,
            paymentStatus,
            paymentHeaders,
            paymentStatusOptions,
            filteredPayments,

            // Специализации
            specializations,
            specializationSearch,
            editingSpecialization,
            selectedSpecialization,
            deleteDialog,
            specializationForm,
            specializationHeaders,
            filteredSpecializations,

            // Форматирование
            formatDate,
            formatDateTime,
            formatCurrency,
            getRoleColor,
            getRoleText,
            getStatusColor,
            getStatusText,
            getPaymentStatusColor,
            getPaymentStatusText,

            // Функции для пользователей
            viewUser,
            editUser,
            saveUser,
            toggleUserStatus,

            // Функции для врачей
            viewDoctor,
            editDoctor,
            toggleDoctorVerification,

            // Функции для записей
            viewAppointment,
            editAppointment,

            // Функции для платежей
            viewPayment,
            markPaymentCompleted,

            // Функции для специализаций
            editSpecialization,
            cancelEditSpecialization,
            saveSpecialization,
            confirmDeleteSpecialization,
            deleteSpecialization
        }
    }
}
</script>

<style scoped>
.admin {
    background-color: #f5f5f5;
    min-height: calc(100vh - 64px);
}

.stat-card {
    height: 100%;
    transition: transform 0.3s ease-in-out;
}

.stat-card:hover {
    transform: translateY(-5px);
}
</style>