import { createRouter, createWebHistory } from 'vue-router'

import IndexView from '@/views/IndexView.vue'

import DirectoriesView from '@/views/DirectoriesView.vue'
import DirectoriesIndex from '@/views/Directories/IndexView.vue'
import DirectoryView from '@/views/Directories/DirectoryView.vue'

import PriceListsView from '@/views/PriceListsView.vue'
import PriceListsIndex from '@/views/PriceLists/IndexView.vue'
import PriceListsCreate from '@/views/PriceLists/CreateView.vue'
import PriceListsClone from '@/views/PriceLists/CloneView.vue'

import OutlayIndexView from '@/views/Outlay/IndexView.vue'

import OutlayView from '@/views/OutlayView.vue'
import PrintView from '@/views/PrintView.vue'

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
      path: '/outlay',
      name: 'outlay',
      component: OutlayView,
      meta: {
        layout: 'MainLayout',
      },
      children: [
        {
          path: '',
          name: 'smetaIndexView',
          component: OutlayIndexView,
        },
      ],
    },
    {
      path: '/outlay/:id',
      name: 'outlayView',
      component: OutlayView,
      meta: {
        layout: 'OutlayLayout',
      },
    },
    {
      path: '/print/:id',
      name: 'printView',
      component: PrintView,
      meta: {
        layout: 'PrintLayout',
      },
    },
    {
      path: '/outlay/:id/acts',
      name: 'actsView',
      component: OutlayView,
      meta: {
        layout: 'ActLayout',
      },
    },
  ],
})

export default router
