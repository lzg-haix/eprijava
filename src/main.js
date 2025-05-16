import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { PAS } from '@/utils/pas-util'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import DialogService from 'primevue/dialogservice'
import ToastService from 'primevue/toastservice'
import JsonExcel from 'vue-json-excel3'

const app = createApp(App)

app.config.globalProperties.$pas = PAS

app.component('downloadExcel', JsonExcel)

app.use(router)
app.use(PrimeVue)
app.use(ConfirmationService)
app.use(DialogService)
app.use(ToastService)

app.mount('#app')
