import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { PAS } from '@/utils/pas-util'
import PrimeVue from 'primevue/config'

const app = createApp(App)

app.config.globalProperties.$pas = PAS

app.use(router)
app.use(PrimeVue)

app.mount('#app')
