import { EnumUserRole } from 'src/data/roles'
import type { RouteRecordRaw } from 'vue-router'

// QR routes (require authentication but accessible via direct link)
const qrRoutes: RouteRecordRaw[] = [
  {
    path: '/qr',
    component: () => import('layouts/LoginLayout.vue'), // lightweight neutral layout
    children: [
      {
        path: ':token',
        name: 'qr-public',
        component: () => import('pages/student-page/checkinout/QRClaimPage.vue'),
        props: true,
        // Use alias instead of redirect so the original URL is preserved
        alias: ['/Student/qr/:token', '/student/qr/:token'],
        meta: {
          scope: 'public', // ไม่ต้อง Login
          requiresAuth: false,
        },
      },
      {
        path: 'claim/:claimToken',
        name: 'qr-checkinout-claim',
        component: () => import('pages/student-page/checkinout/CheckinoutPage.vue'),
        props: true,
        meta: {
          scope: 'checkinout',
          requiresAuth: true,
          redirectToLogin: true,
        },
      },
      // Legacy route (สำหรับ UUID แบบเก่า)
      {
        path: ':uuid',
        name: 'qr-checkinout',
        component: () => import('pages/student-page/checkinout/CheckinoutPage.vue'),
        props: true,
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
