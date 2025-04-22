<template>
    <div class="documents">
        <v-container>
            <h1 class="text-h4 mb-6">Мои документы</h1>

            <v-row>
                <!-- Загрузка документов -->
                <v-col cols="12" md="4">
                    <v-card class="mb-6">
                        <v-card-title>
                            Загрузить документ
                        </v-card-title>

                        <v-card-text>
                            <v-file-input v-model="fileInput" label="Выберите файл"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" prepend-icon="mdi-file-upload"
                                @change="handleFileChange" :error-messages="fileError"></v-file-input>

                            <v-text-field v-model="documentName" label="Название документа"
                                :error-messages="nameError"></v-text-field>

                            <v-select v-model="documentType" :items="documentTypes" label="Тип документа"
                                :error-messages="typeError"></v-select>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" @click="uploadDocument" :loading="uploading" :disabled="!fileInput">
                                Загрузить
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>

                <!-- Список документов -->
                <v-col cols="12" md="8">
                    <v-card>
                        <v-card-title class="d-flex align-center">
                            <span>Ваши документы</span>
                            <v-spacer></v-spacer>
                            <v-text-field v-model="search" append-icon="mdi-magnify" label="Поиск" hide-details
                                density="compact" class="mx-4" style="max-width: 300px"></v-text-field>
                        </v-card-title>

                        <v-data-table :headers="headers" :items="filteredDocuments" :loading="loading"
                            class="elevation-1">
                            <template v-slot:item.type="{ item }">
                                <v-chip :color="getTypeColor(item.type)" size="small">
                                    {{ item.type }}
                                </v-chip>
                            </template>

                            <template v-slot:item.createdAt="{ item }">
                                {{ formatDate(item.createdAt) }}
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <v-btn icon size="small" color="primary" @click="viewDocument(item)">
                                    <v-icon>mdi-eye</v-icon>
                                </v-btn>

                                <v-btn icon size="small" color="primary" class="mx-1" @click="downloadDocument(item)">
                                    <v-icon>mdi-download</v-icon>
                                </v-btn>

                                <v-btn icon size="small" color="error" @click="confirmDeleteDocument(item)">
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </template>
                        </v-data-table>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>

        <!-- Диалог просмотра документа -->
        <v-dialog v-model="previewDialog" max-width="800">
            <v-card>
                <v-card-title>
                    {{ selectedDocument?.name }}
                    <v-spacer></v-spacer>
                    <v-btn icon @click="previewDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <div v-if="selectedDocument?.type === 'PDF'" class="text-center">
                        <iframe :src="selectedDocument?.url" width="100%" height="500" style="border: none;"></iframe>
                    </div>

                    <div v-else-if="isImage(selectedDocument?.type)" class="text-center">
                        <v-img :src="selectedDocument?.url" max-height="500" contain></v-img>
                    </div>

                    <div v-else class="text-center py-8">
                        <v-icon size="64" color="grey">mdi-file-document</v-icon>
                        <p class="mt-4">Документ нельзя просмотреть. Скачайте его для просмотра.</p>
                    </div>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="downloadDocument(selectedDocument)">
                        Скачать
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Диалог подтверждения удаления -->
        <v-dialog v-model="deleteDialog" max-width="400">
            <v-card>
                <v-card-title>
                    Удалить документ?
                </v-card-title>

                <v-card-text>
                    Вы уверены, что хотите удалить документ "{{ selectedDocument?.name }}"? Это действие нельзя
                    отменить.
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" variant="text" @click="deleteDialog = false">
                        Отмена
                    </v-btn>
                    <v-btn color="error" @click="deleteDocument" :loading="deleting">
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default {
    name: 'DocumentsView',
    setup() {
        // States
        const fileInput = ref(null)
        const documentName = ref('')
        const documentType = ref(null)
        const documents = ref([])
        const search = ref('')
        const loading = ref(false)
        const uploading = ref(false)
        const deleting = ref(false)
        const previewDialog = ref(false)
        const deleteDialog = ref(false)
        const selectedDocument = ref(null)
        const fileError = ref('')
        const nameError = ref('')
        const typeError = ref('')

        // Document types
        const documentTypes = [
            'Медицинская карта',
            'Результаты анализов',
            'Рецепт',
            'Справка',
            'Снимок',
            'Другое'
        ]

        // Table headers
        const headers = [
            { title: 'Название', key: 'name' },
            { title: 'Тип', key: 'type' },
            { title: 'Дата загрузки', key: 'createdAt' },
            { title: 'Действия', key: 'actions', sortable: false }
        ]

        // Фильтрация документов по поиску
        const filteredDocuments = computed(() => {
            if (!search.value) return documents.value

            const searchLower = search.value.toLowerCase()
            return documents.value.filter(doc =>
                doc.name.toLowerCase().includes(searchLower) ||
                doc.type.toLowerCase().includes(searchLower)
            )
        })

        // Проверка типа файла
        const isImage = (type) => {
            return ['JPG', 'JPEG', 'PNG'].includes(type?.toUpperCase())
        }

        // Получение цвета для типа документа
        const getTypeColor = (type) => {
            const colors = {
                'Медицинская карта': 'primary',
                'Результаты анализов': 'success',
                'Рецепт': 'warning',
                'Справка': 'info',
                'Снимок': 'purple',
                'Другое': 'grey'
            }

            return colors[type] || 'grey'
        }

        // Форматирование даты
        const formatDate = (date) => {
            return format(new Date(date), 'dd MMMM yyyy', { locale: ru })
        }

        // Обработка изменения файла
        const handleFileChange = () => {
            if (!fileInput.value) return

            fileError.value = ''

            // Автозаполнение имени документа из имени файла
            if (!documentName.value && fileInput.value.name) {
                const fileName = fileInput.value.name
                const lastDotIndex = fileName.lastIndexOf('.')
                const nameWithoutExt = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName
                documentName.value = nameWithoutExt
            }

            // Автоопределение типа документа по расширению
            if (!documentType.value && fileInput.value.name) {
                const extension = fileInput.value.name.split('.').pop()?.toLowerCase()

                if (['jpg', 'jpeg', 'png'].includes(extension)) {
                    documentType.value = 'Снимок'
                } else if (['pdf'].includes(extension)) {
                    documentType.value = 'Медицинская карта'
                } else if (['doc', 'docx'].includes(extension)) {
                    documentType.value = 'Справка'
                }
            }
        }

        // Загрузка документа
        const uploadDocument = async () => {
            // Валидация формы
            let isValid = true

            if (!fileInput.value) {
                fileError.value = 'Выберите файл'
                isValid = false
            }

            if (!documentName.value) {
                nameError.value = 'Введите название документа'
                isValid = false
            }

            if (!documentType.value) {
                typeError.value = 'Выберите тип документа'
                isValid = false
            }

            if (!isValid) return

            try {
                uploading.value = true

                // Имитация загрузки для демонстрации
                await new Promise(resolve => setTimeout(resolve, 1500))

                // Добавление документа в список
                documents.value.push({
                    id: Date.now(),
                    name: documentName.value,
                    type: documentType.value,
                    size: fileInput.value.size,
                    createdAt: new Date(),
                    url: URL.createObjectURL(fileInput.value)
                })

                // Сброс формы
                fileInput.value = null
                documentName.value = ''
                documentType.value = null

                // Тут должен быть запрос к API для загрузки документа
            } catch (error) {
                console.error('Error uploading document:', error)
            } finally {
                uploading.value = false
            }
        }

        // Просмотр документа
        const viewDocument = (document) => {
            selectedDocument.value = document
            previewDialog.value = true
        }

        // Скачивание документа
        const downloadDocument = (document) => {
            if (!document || !document.url) return

            const link = document.createElement('a')
            link.href = document.url
            link.download = document.name
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }

        // Подтверждение удаления документа
        const confirmDeleteDocument = (document) => {
            selectedDocument.value = document
            deleteDialog.value = true
        }

        // Удаление документа
        const deleteDocument = async () => {
            if (!selectedDocument.value) return

            try {
                deleting.value = true

                // Имитация запроса для демонстрации
                await new Promise(resolve => setTimeout(resolve, 1000))

                // Удаление документа из списка
                documents.value = documents.value.filter(doc => doc.id !== selectedDocument.value.id)

                deleteDialog.value = false

                // Тут должен быть запрос к API для удаления документа
            } catch (error) {
                console.error('Error deleting document:', error)
            } finally {
                deleting.value = false
            }
        }

        // Загрузка списка документов
        const fetchDocuments = async () => {
            try {
                loading.value = true

                // Имитация запроса для демонстрации
                await new Promise(resolve => setTimeout(resolve, 1000))

                // Тут должен быть запрос к API для получения списка документов

                documents.value = [
                    {
                        id: 1,
                        name: 'Медицинская карта',
                        type: 'Медицинская карта',
                        size: 1024 * 1024 * 2.5, // 2.5 MB
                        createdAt: new Date(2023, 5, 15),
                        url: 'https://example.com/documents/1'
                    },
                    {
                        id: 2,
                        name: 'Результаты анализов крови',
                        type: 'Результаты анализов',
                        size: 1024 * 512, // 512 KB
                        createdAt: new Date(2023, 6, 20),
                        url: 'https://example.com/documents/2'
                    },
                    {
                        id: 3,
                        name: 'Рецепт от невролога',
                        type: 'Рецепт',
                        size: 1024 * 256, // 256 KB
                        createdAt: new Date(2023, 7, 5),
                        url: 'https://example.com/documents/3'
                    }
                ]
            } catch (error) {
                console.error('Error fetching documents:', error)
            } finally {
                loading.value = false
            }
        }

        onMounted(() => {
            fetchDocuments()
        })

        return {
            fileInput,
            documentName,
            documentType,
            documentTypes,
            documents,
            search,
            loading,
            uploading,
            deleting,
            previewDialog,
            deleteDialog,
            selectedDocument,
            headers,
            fileError,
            nameError,
            typeError,
            filteredDocuments,
            isImage,
            getTypeColor,
            formatDate,
            handleFileChange,
            uploadDocument,
            viewDocument,
            downloadDocument,
            confirmDeleteDocument,
            deleteDocument
        }
    }
}
</script>

<style scoped>
.documents {
    min-height: calc(100vh - 64px);
}
</style>