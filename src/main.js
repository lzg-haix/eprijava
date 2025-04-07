import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { PAS } from '@/utils/pas-util'
const app = createApp(App)

app.config.globalProperties.$pas = PAS

app.use(router)

app.mount('#app')
