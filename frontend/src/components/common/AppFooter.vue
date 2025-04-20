<template>
  <v-footer app color="primary" dark class="d-flex flex-column">
    <div class="px-4 py-2 text-center w-100">
      <v-row>
        <v-col cols="12" sm="4">
          <h3 class="text-h6 mb-2">О нас</h3>
          <p class="text-body-2">
            BISP - ваша платформа для онлайн-консультаций с врачами
          </p>
        </v-col>
        
        <v-col cols="12" sm="4">
          <h3 class="text-h6 mb-2">Контакты</h3>
          <p class="text-body-2">
            Email: support@bisp.com<br>
            Телефон: +7 (XXX) XXX-XX-XX
          </p>
        </v-col>
        
        <v-col cols="12" sm="4">
          <h3 class="text-h6 mb-2">Ссылки</h3>
          <v-btn variant="text" class="text-white" to="/about">
            О сервисе
          </v-btn>
          <v-btn variant="text" class="text-white" to="/privacy">
            Конфиденциальность
          </v-btn>
          <v-btn variant="text" class="text-white" to="/terms">
            Условия использования
          </v-btn>
        </v-col>
      </v-row>
    </div>
    
    <div class="px-4 py-2 text-center w-100">
      {{ new Date().getFullYear() }} — <strong>BISP</strong>
    </div>
  </v-footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script> 