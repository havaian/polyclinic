<template>
  <div class="min-h-screen">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Добро пожаловать в E-Polyclinic
        </h1>
      </div>
    </header>

    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <!-- Карточка записи на приём -->
            <div class="card">
              <h2 class="text-xl font-semibold mb-4">Запись на приём</h2>
              <p class="text-gray-600 mb-4">
                Запишитесь на приём к врачу в удобное для вас время
              </p>
              <button class="btn btn-primary">
                Записаться
              </button>
            </div>

            <!-- Карточка онлайн консультации -->
            <div class="card">
              <h2 class="text-xl font-semibold mb-4">Онлайн консультация</h2>
              <p class="text-gray-600 mb-4">
                Получите консультацию врача онлайн, не выходя из дома
              </p>
              <button class="btn btn-primary">
                Начать консультацию
              </button>
            </div>

            <!-- Карточка медицинской карты -->
            <div class="card">
              <h2 class="text-xl font-semibold mb-4">Медицинская карта</h2>
              <p class="text-gray-600 mb-4">
                Просмотрите историю ваших посещений и результаты анализов
              </p>
              <button class="btn btn-primary">
                Открыть карту
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script> 