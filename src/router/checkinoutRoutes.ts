import { EnumUserRole } from 'src/data/roles'
import type { RouteRecordRaw } from 'vue-router'

export const checkinoutRoutes: RouteRecordRaw[] = [
  {
    path: '/checkin',
    component: () => import('layouts/LoginLayout.vue'), // หรือเปลี่ยน layout ตามต้องการ
    meta: { role: EnumUserRole.STUDENT },
    children: [
      {
        path: ':uuid',
        name: 'checkin',
        component: () => import('pages/student-page/checkinout/CheckinoutPage.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/checkout',
    component: () => import('layouts/LoginLayout.vue'), // หรือเปลี่ยน layout ตามต้องการ
    meta: { role: EnumUserRole.STUDENT },
    children: [
      {
        path: ':uuid',
        name: 'checkout',
        component: () => import('pages/student-page/checkinout/CheckinoutPage.vue'),
        props: true,
      },
    ],
  },
]
