// layers.css MUST come first: the first @layer statement fixes the layer order for the app.
import '@/styles/layers.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@mdi/font/css/materialdesignicons.css'
import vuetify from '@/plugins/vuetify'
import router from '@/router'
import App from './App.vue'
import '@/styles/main.css'

createApp(App).use(createPinia()).use(vuetify).use(router).mount('#app')
