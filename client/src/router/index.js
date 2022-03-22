import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      children: [
        {
          path: 'rooms',
          name: 'rooms',
          component: () => import('@/views/Admin/SubcategoryView.vue'),
        },
        {
          path: 'subcategories',
          name: 'subcategories',
          component: () => import('@/views/Admin/SubcategoryView.vue'),
          children: [
            {
              path: '',
              component: () =>
                import('@/views/Admin/Subcategory/IndexView.vue'),
            },
            {
              path: 'add',
              component: () => import('@/views/Admin/Subcategory/AddView.vue'),
            },
          ],
        },
        {
          path: 'categories',
          name: 'categories',
          component: () => import('@/views/Admin/SubcategoryView.vue'),
        },
      ],
    },
  ],
})

export default router
