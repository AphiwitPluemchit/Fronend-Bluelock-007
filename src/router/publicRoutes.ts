// publicRoutes.ts หรือใส่ใน routes.ts ก็ได้
import type { RouteRecordRaw } from 'vue-router'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/LoginLayout.vue'), // 👈 ใช้ LoginLayout
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('pages/login-page/LoginPage.vue'),
        meta: { public: true },
      },
    ],
  },
]
