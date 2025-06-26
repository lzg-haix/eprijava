import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../components/MainPage.vue'
import SignUp from '../components/SignUp.vue'

const routes = [
  {
    path: '/',
    name: 'MainPage',
    component: MainPage,
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: () => import('@/components/AdminPanel.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
