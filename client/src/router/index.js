import { createRouter, createWebHistory } from 'vue-router'

import IndexView from '@/views/IndexView.vue'

import DirectoriesIndex from '@/views/Directories/IndexView.vue'
import DirectoryView from '@/views/Directories/DirectoryView.vue'

import PriceListsIndex from '@/views/PriceLists/IndexView.vue'
import PriceListsCreate from '@/views/PriceLists/CreateView.vue'

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
      path: '/directories/:id',
      name: 'directory',
      component: DirectoryView,
    },
    {
      path: '/pricelists',
      name: 'pricelists',
      component: PriceListsIndex,
      children: [
        {
          path: 'create',
          name: 'createEdition',
          component: PriceListsCreate,
        },
      ],
    },
  ],
})

export default router
