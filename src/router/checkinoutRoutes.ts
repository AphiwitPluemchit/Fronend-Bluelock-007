import { EnumUserRole } from 'src/data/roles'
import type { RouteRecordRaw } from 'vue-router'

// QR routes (require authentication but accessible via direct link)
const qrRoutes: RouteRecordRaw[] = [
  {
    path: '/qr',
    component: () => import('layouts/LoginLayout.vue'), // lightweight neutral layout
    children: [
      {
        path: ':uuid',
        name: 'qr-checkinout',
        component: () => import('pages/student-page/checkinout/CheckinoutPage.vue'),
        props: true,
        // Use alias instead of redirect so the original URL is preserved
        alias: ['/Student/qr/:uuid', '/student/qr/:uuid'],
        meta: {
          scope: 'checkinout',
          requiresAuth: true,
          redirectToLogin: true,
        },
      },
    ],
  },
]

// Protected student routes (require authentication)
const protectedStudentRoutes: RouteRecordRaw[] = [
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
  // QR routes (require authentication)
  ...qrRoutes,

  // Protected student routes with layout
  {
    path: `/${EnumUserRole.STUDENT}`,
    name: EnumUserRole.STUDENT,
    component: () => import('layouts/LoginLayout.vue'),
    meta: { role: EnumUserRole.STUDENT },
    children: protectedStudentRoutes,
  },
]
