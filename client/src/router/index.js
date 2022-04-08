import { createRouter, createWebHistory } from 'vue-router'

import IndexView from '@/views/IndexView.vue'

import DirectoriesView from '@/views/DirectoriesView.vue'
import DirectoriesIndex from '@/views/Directories/IndexView.vue'
import DirectoryView from '@/views/Directories/DirectoryView.vue'

import PriceListsView from '@/views/PriceListsView.vue'
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
      component: DirectoriesView,
      children: [
        {
          path: '',
          name: 'directoriesIndex',
          component: DirectoriesIndex,
        },
        {
          path: ':id',
          name: 'directoriyView',
          component: DirectoryView,
        },
      ],
    },
    {
      path: '/pricelists',
      name: 'pricelists',
      component: PriceListsView,
      children: [
        {
          path: '',
          name: 'pricelistsIndex',
          component: PriceListsIndex,
        },
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
