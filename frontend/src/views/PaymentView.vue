<template>
    <div class="payment-view">
        <v-container>
            <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px;">
                <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
            </div>

            <div v-else-if="error" class="text-center py-8">
                <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
                <h2 class="text-h5 mb-2">Произошла ошибка</h2>
                <p class="text-body-1 text-medium-emphasis mb-4">{{ error }}</p>
                <v-btn color="primary" @click="fetchPaymentData">Повторить</v-btn>
            </div>

            <div v-else-if="status === 'success'" class="success-container">
                <div class="text-center py-8">
                    <v-icon color="success" size="84" class="mb-4">mdi-check-circle</v-icon>
                    <h1 class="text-h4 mb-2">Оплата успешно выполнена!</h1>
                    <p class="text-body-1 text-medium-emphasis mb-6">
                        Ваш платеж был успешно обработан. Детали заказа отправлены на вашу электронную почту.
                    </p>

                    <v-card class="mx-auto payment-details" max-width="600">
                        <v-card-title class="text-center py-4">
                            Детали платежа
                        </v-card-title>

                        <v-divider></v-divider>

                        <v-card-text class="pa-4">
                            <v-row>
                                <v-col cols="6" class="text-subtitle-2 text-medium-emphasis">
                                    Идентификатор платежа:
                                </v-col>
                                <v-col cols="6" class="text-subtitle-2 text-right">
                                    {{ payment.id }}
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="6" class="text-subtitle-2 text-medium-emphasis">
                                    Дата платежа:
                                </v-col>
                                <v-col cols="6" class="text-subtitle-2 text-right">
                                    {{ formatDateTime(payment.paidAt) }}
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="6" class="text-subtitle-2 text-medium-emphasis">
                                    Сумма:
                                </v-col>
                                <v-col cols="6" class="text-subtitle-2 text-right">
                                    {{ formatPrice(payment.amount) }}
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="6" class="text-subtitle-2 text-medium-emphasis">
                                    Метод оплаты:
                                </v-col>
                                <v-col cols="6" class="text-subtitle-2 text-right">
                                    {{ getPaymentMethodText(payment.paymentMethod) }}
                                </v-col>
                            </v-row>

                            <v-divider class="my-3"></v-divider>

                            <v-row>
                                <v-col cols="6" class="text-subtitle-2 text-medium-emphasis">
                                    Доктор:
                                </v-col>
                                <v-col cols="6" class="text-subtitle-2 text-right">
                                    {{ payment.doctor.firstName }} {{ payment.doctor.lastName }}
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="6" class="text-subtitle-2 text-medium-emphasis">
                                    Специализация:
                                </v-col>
                                <v-col cols="6" class="text-subtitle-2 text-right">
                                    {{ payment.doctor.specialization }}
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="6" class="text-subtitle-2 text-medium-emphasis">
                                    Дата и время записи:
                                </v-col>
                                <v-col cols="6" class="text-subtitle-2 text-right">
                                    {{ formatDateTime(payment.appointment.dateTime) }}
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="6" class="text-subtitle-2 text-medium-emphasis">
                                    Тип консультации:
                                </v-col>
                                <v-col cols="6" class="text-subtitle-2 text-right">
                                    {{ getConsultationTypeText(payment.appointment.type) }}
                                </v-col>
                            </v-row>
                        </v-card-text>

                        <v-divider></v-divider>

                        <v-card-actions class="pa-4">
                            <v-btn color="primary" variant="text" @click="downloadReceipt" prepend-icon="mdi-download">
                                Скачать чек
                            </v-btn>

                            <v-spacer></v-spacer>

                            <v-btn color="primary" @click="goToAppointment">
                                Перейти к записи
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </div>
            </div>

            <div v-else-if="status === 'pending'" class="pending-container">
                <div class="text-center py-8">
                    <v-icon color="warning" size="84" class="mb-4">mdi-clock</v-icon>
                    <h1 class="text-h4 mb-2">Платеж в обработке</h1>
                    <p class="text-body-1 text-medium-emphasis mb-6">
                        Ваш платеж обрабатывается. Это может занять некоторое время.
                    </p>

                    <v-btn color="primary" @click="checkPaymentStatus" class="mb-4">
                        Проверить статус
                    </v-btn>

                    <p class="text-caption text-medium-emphasis">
                        Мы уведомим вас по электронной почте, как только платеж будет обработан.
                    </p>
                </div>
            </div>

            <div v-else-if="status === 'failed'" class="failed-container">
                <div class="text-center py-8">
                    <v-icon color="error" size="84" class="mb-4">mdi-close-circle</v-icon>
                    <h1 class="text-h4 mb-2">Ошибка платежа</h1>
                    <p class="text-body-1 text-medium-emphasis mb-6">
                        К сожалению, при обработке вашего платежа возникла ошибка.
                    </p>

                    <v-btn color="primary" @click="retryPayment" class="mb-4">
                        Повторить платеж
                    </v-btn>

                    <p class="text-caption text-medium-emphasis">
                        Если проблема сохраняется, пожалуйста, свяжитесь с нашей службой поддержки.
                    </p>
                </div>
            </div>

            <div v-else class="empty-container">
                <div class="text-center py-8">
                    <v-icon color="grey" size="84" class="mb-4">mdi-cash</v-icon>
                    <h1 class="text-h4 mb-2">Информация о платеже</h1>
                    <p class="text-body-1 text-medium-emphasis mb-6">
                        Нет активных платежей для отображения.
                    </p>

                    <v-btn color="primary" to="/appointments" class="mb-4">
                        Вернуться к записям
                    </v-btn>
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
    name: 'PaymentView',
    setup() {
        const store = useStore()
        const router = useRouter()
        const route = useRoute()

        const loading = ref(false)
        const error = ref(null)
        const paymentId = ref(route.query.payment_id)
        const sessionId = ref(route.query.session_id)
        const status = ref('') // pending, success, failed
        const payment = ref({})

        const fetchPaymentData = async () => {
            try {
                loading.value = true
                error.value = null

                if (sessionId.value) {
                    // Если есть ID сессии, проверяем статус платежа
                    const result = await store.dispatch('payments/getPaymentStatus', { sessionId: sessionId.value })
                    paymentId.value = result.paymentId
                    status.value = result.status
                    payment.value = result.payment
                } else if (paymentId.value) {
                    // Если есть ID платежа, получаем данные о платеже
                    const result = await store.dispatch('payments/getPaymentById', paymentId.value)
                    status.value = result.status
                    payment.value = result
                } else {
                    // Если нет ни ID сессии, ни ID платежа, показываем пустую страницу
                    status.value = 'empty'
                }
            } catch (err) {
                console.error('Error fetching payment data:', err)
                error.value = err.message || 'Ошибка при получении данных о платеже'
            } finally {
                loading.value = false
            }
        }

        const checkPaymentStatus = async () => {
            try {
                loading.value = true
                error.value = null

                // Повторная проверка статуса платежа
                await fetchPaymentData()
            } catch (err) {
                console.error('Error checking payment status:', err)
                error.value = err.message || 'Ошибка при проверке статуса платежа'
            } finally {
                loading.value = false
            }
        }

        const retryPayment = () => {
            // Перенаправление на страницу оплаты соответствующей записи
            if (payment.value && payment.value.appointment) {
                router.push(`/appointments/${payment.value.appointment.id}/payment`)
            } else {
                router.push('/appointments')
            }
        }

        const goToAppointment = () => {
            if (payment.value && payment.value.appointment) {
                router.push(`/appointments/${payment.value.appointment.id}`)
            } else {
                router.push('/appointments')
            }
        }

        const downloadReceipt = () => {
            // Обработка скачивания чека
            if (payment.value && payment.value.invoiceUrl) {
                window.open(payment.value.invoiceUrl, '_blank')
            }
        }

        const formatDateTime = (dateString) => {
            if (!dateString) return 'Н/Д'
            return format(new Date(dateString), 'd MMMM yyyy, HH:mm', { locale: ru })
        }

        const formatPrice = (amount) => {
            if (!amount) return '0 ₽'
            return new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB'
            }).format(amount)
        }

        const getPaymentMethodText = (method) => {
            const methods = {
                'card': 'Банковская карта',
                'bank_transfer': 'Банковский перевод',
                'cash': 'Наличные'
            }
            return methods[method] || method
        }

        const getConsultationTypeText = (type) => {
            const types = {
                'video': 'Видеоконсультация',
                'chat': 'Текстовый чат',
                'voice': 'Аудиоконсультация'
            }
            return types[type] || type
        }

        onMounted(() => {
            // Инициализируем данные о платеже с имитацией ответа от сервера
            // (в реальном приложении здесь будет запрос к API)

            // Имитация ответа сервера
            setTimeout(() => {
                status.value = 'success'
                payment.value = {
                    id: 'PAY-123456789',
                    amount: 2000,
                    currency: 'RUB',
                    status: 'succeeded',
                    paymentMethod: 'card',
                    paidAt: new Date().toISOString(),
                    invoiceUrl: '#',
                    doctor: {
                        firstName: 'Александр',
                        lastName: 'Иванов',
                        specialization: 'Терапевт'
                    },
                    appointment: {
                        id: 'APT-123456',
                        dateTime: new Date(new Date().getTime() + 86400000).toISOString(), // завтра
                        type: 'video'
                    }
                }
                loading.value = false
            }, 1500)

            // В реальном приложении раскомментировать:
            // fetchPaymentData()
        })

        return {
            loading,
            error,
            status,
            payment,
            fetchPaymentData,
            checkPaymentStatus,
            retryPayment,
            goToAppointment,
            downloadReceipt,
            formatDateTime,
            formatPrice,
            getPaymentMethodText,
            getConsultationTypeText
        }
    }
}
</script>