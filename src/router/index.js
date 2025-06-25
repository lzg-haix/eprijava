import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../components/MainPage.vue'
import SignUp from '../components/SignUp.vue'
import AdminPanel from '../components/AdminPanel.vue'

const routes = [
  {
    path: '/',
    name: 'MainPage',
    component: MainPage,
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
