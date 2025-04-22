<template>
    <div class="not-found">
        <v-container class="fill-height">
            <v-row align="center" justify="center">
                <v-col cols="12" md="8" class="text-center">
                    <v-img src="@/assets/404.svg" max-height="300" contain class="mb-8"></v-img>

                    <h1 class="text-h2 mb-6">404</h1>
                    <h2 class="text-h4 mb-4">Страница не найдена</h2>
                    <p class="text-body-1 mb-8">
                        Упс! Страница, которую вы ищете, не существует или была перемещена.
                    </p>

                    <v-btn color="primary" size="large" to="/">
                        Вернуться на главную
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
export default {
    name: 'NotFoundView'
}
</script>

<style scoped>
.not-found {
    background-color: #f5f5f5;
    min-height: 100vh;
    display: flex;
    align-items: center;
}
</style>