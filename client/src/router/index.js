import { createRouter, createWebHistory } from 'vue-router'

import IndexView from '@/views/IndexView.vue'
import DirectoriesView from '@/views/DirectoriesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: IndexView,
    },
    {
      path: '/directories',
      name: 'directories',
      component: DirectoriesView,
    },
  ],
})

export default router
