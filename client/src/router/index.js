import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminView from '@/views/AdminView.vue'
import AdminSubpage from '@/views/Admin/SubpageView.vue'

import CategoryIndexView from '../views/Admin/Categories/IndexView.vue'
import CategoryAddView from '../views/Admin/Categories/AddView.vue'
import CategoryEditView from '../views/Admin/Categories/EditView.vue'

import SubcategoryIndexView from '../views/Admin/Subcategories/IndexView.vue'
import SubcategoryAddView from '../views/Admin/Subcategories/AddView.vue'
import SubcategoryEditView from '../views/Admin/Subcategories/EditView.vue'

import RoomIndexView from '../views/Admin/Rooms/IndexView.vue'
import RoomAddView from '../views/Admin/Rooms/AddView.vue'
import RoomEditView from '../views/Admin/Rooms/EditView.vue'

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
      component: AdminView,
      children: [
        {
          path: 'rooms',
          name: 'rooms',
          meta: {
            title: 'Комнаты',
          },
          component: AdminSubpage,
          children: [
            {
              path: '',
              name: 'roomsIndex',
              component: RoomIndexView,
            },
            {
              path: 'add',
              name: 'roomsAdd',
              component: RoomAddView,
            },
            {
              path: 'edit/:id',
              name: 'roomsEdit',
              component: RoomEditView,
            },
          ],
        },
        {
          path: 'subcategories',
          name: 'subcategories',
          meta: {
            title: 'Подкатегории',
          },
          component: AdminSubpage,
          children: [
            {
              path: '',
              name: 'subcategoriesIndex',
              component: SubcategoryIndexView,
            },
            {
              path: 'add',
              name: 'subcategoriesAdd',
              component: SubcategoryAddView,
            },
            {
              path: 'edit/:id',
              name: 'subcategoriesEdit',
              component: SubcategoryEditView,
            },
          ],
        },
        {
          path: 'categories',
          name: 'categories',
          meta: {
            title: 'Категории',
          },
          component: AdminSubpage,
          children: [
            {
              path: '',
              name: 'categoriesIndex',
              component: CategoryIndexView,
            },
            {
              path: 'add',
              name: 'categoriesAdd',
              component: CategoryAddView,
            },
            {
              path: 'edit/:id',
              name: 'categoriesEdit',
              component: CategoryEditView,
            },
          ],
        },
      ],
    },
  ],
})

export default router
