import { EnumUserRole } from 'src/data/roles'
import type { RouteRecordRaw } from 'vue-router'

const checkinoutChildren: RouteRecordRaw[] = [
  {
    path: '/student/qr',
    children: [
      {
        path: ':uuid',
        name: 'student-qr',
        component: () => import('pages/student-page/checkinout/CheckinoutPage.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/student/qr',
    children: [
      {
        path: ':uuid',
        name: 'student-qr',
        component: () => import('pages/student-page/checkinout/CheckinoutPage.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/student/forms',
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

].map((route) => ({
  ...route,
  meta: { role: EnumUserRole.STUDENT },
}))

export const checkinoutRoutes: RouteRecordRaw[] = [
  {
    path: `/${EnumUserRole.STUDENT}`,
    name: EnumUserRole.STUDENT,
    component: () => import('layouts/LoginLayout.vue'),
    meta: { role: EnumUserRole.STUDENT },
    children: checkinoutChildren,
  },
]
