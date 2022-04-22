import { createRouter, createWebHistory } from 'vue-router'

import IndexView from '@/views/IndexView.vue'

import DirectoriesView from '@/views/DirectoriesView.vue'
import DirectoriesIndex from '@/views/Directories/IndexView.vue'
import DirectoryView from '@/views/Directories/DirectoryView.vue'

import PriceListsView from '@/views/PriceListsView.vue'
import PriceListsIndex from '@/views/PriceLists/IndexView.vue'
import PriceListsCreate from '@/views/PriceLists/CreateView.vue'
import PriceListsClone from '@/views/PriceLists/CloneView.vue'

import SmetaIndexView from '@/views/Smeta/IndexView.vue'

import SmetaView from '@/views/SmetaView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: IndexView,
      meta: {
        layout: 'MainLayout',
      },
    },
    {
      path: '/directories',
      name: 'directories',
      component: DirectoriesView,
      meta: {
        layout: 'MainLayout',
      },
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
      meta: {
        layout: 'MainLayout',
      },
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
        {
          path: 'clone/:id',
          name: 'cloneEdition',
          component: PriceListsClone,
        },
      ],
    },
    {
      path: '/smeta',
      name: 'smeta',
      component: SmetaIndexView,
      meta: {
        layout: 'MainLayout',
      },
    },
    {
      path: '/smeta1',
      name: 'smeta1',
      component: SmetaView,
      meta: {
        layout: 'SmetaLayout',
      },
    },
  ],
})

export default router
