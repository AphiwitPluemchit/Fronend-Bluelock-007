import { EnumUserRole } from 'src/data/roles'
import type { RouteRecordRaw } from 'vue-router'

export const checkinoutRoutes: RouteRecordRaw[] = [
  {
    path: '/student/qr',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      {
        path: ':uuid',
        name: 'student-qr',
        component: () => import('pages/student-page/checkinout/CheckinoutPage.vue'),
        props: true,
      },
    ],
  },
  // Forms routes for students
  {
    path: '/student/forms',
    component: () => import('layouts/StudentLayout.vue'),
    meta: { role: EnumUserRole.STUDENT },
    children: [
      {
        path: '',
        name: 'student-forms-list',
        component: () => import('pages/student-page/forms/FormsListPage.vue'),
      },
      {
        path: ':id',
        name: 'student-form-fill',
        component: () => import('pages/student-page/forms/FormFillPage.vue'),
        props: true,
      },
    ],
  },
]
