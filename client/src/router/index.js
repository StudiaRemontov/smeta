import { createRouter, createWebHistory } from 'vue-router'

import IndexView from '@/views/IndexView.vue'
import DirectoriesIndex from '@/views/Directories/IndexView.vue'
import DirectoryView from '@/views/Directories/DirectoryView.vue'

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
      component: DirectoriesIndex,
    },
    {
      path: '/directories/:name',
      name: 'directory',
      component: DirectoryView,
    },
  ],
})

export default router
