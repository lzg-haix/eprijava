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
    path: '/signup',
    name: 'SignUp',
    component: SignUp,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
