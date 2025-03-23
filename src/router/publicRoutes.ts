// publicRoutes.ts
import type { RouteRecordRaw } from 'vue-router'

export const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/LoginLayout.vue'),
    meta: { public: true }, // ✅ เพิ่ม meta public ให้ parent ด้วย
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('pages/login-page/LoginPage.vue'),
        meta: { public: true },
      },
      {
        path: '/unauthorized',
        component: () => import('pages/ErrorUnauthorized.vue'),
        meta: { public: true },
      },
    ],
  },
]
