import { ROUTES_PATH } from '@/services/constants'
import HomeView from '@/views/main/home/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: ROUTES_PATH.HOME,
      name: 'home',
      component: HomeView,
    },
  ],
})

export default router
