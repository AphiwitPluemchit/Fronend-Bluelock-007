import type { RouteRecordRaw } from 'vue-router'
import { publicRoutes } from './publicRoutes'
import { adminRoutes } from './adminRoutes'
import { studentRoutes } from './studentRoutes'

const routes: RouteRecordRaw[] = [
  ...publicRoutes,
  ...adminRoutes,
  ...studentRoutes,
  // {
  //   path: '/:catchAll(.*)*',
  //   component: () => import('pages/ErrorNotFound.vue'),
  // },
]

export default routes
