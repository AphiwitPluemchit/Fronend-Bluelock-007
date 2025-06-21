import { EnumUserRole } from 'src/data/roles'
import type { RouteRecordRaw } from 'vue-router'

// adminRoutes.ts
const adminChildren: RouteRecordRaw[] = [
  {
    path: 'ActivitiesCalendar',
    component: () => import('pages/admin-page/calendar/ActivitiesCalendarPage.vue'),
  },
  {
    path: 'ActivitiesManagement',
    component: () => import('pages/admin-page/activity/ActivitiesTablePage.vue'),
  },
  {
    path: 'ActivitiesManagement/CreateActivityPage',
    component: () => import('pages/admin-page/activity/CreateActivity/CreateActivityPage.vue'),
  },
  {
    path: 'ActivitiesManagement/ActivityDetail/:id',
    component: () => import('src/pages/admin-page/activity/ActivityDetail/ActivityDetailPage.vue'),
  },
  {
    path: 'StudentManagement',
    component: () => import('pages/admin-page/student/StudentTablePage.vue'),
  },
  {
    path: 'StudentStorePage',
    component: () => import('pages/admin-page/student/StudentStorePage.vue'),
  },
  {
    path: 'StudentStorePage/ConfirmStudentDataPage',
    component: () => import('pages/admin-page/student/ConfirmStudentDataPage.vue'),
  },
  {
    path: 'StudentManagement/StudentDetail/:code',
    component: () => import('pages/admin-page/student/StudentDetail/StudentDetailPage.vue'),
  },
  {
    path: 'Report',
    component: () => import('pages/admin-page/report/ReportPage.vue'),
  },
  {
    path: 'CertificateManagement',
    component: () => import('pages/admin-page/certificate/CertificateTablePage.vue'),
  },
].map((route) => ({
  ...route,
  meta: { role: EnumUserRole.ADMIN },
}))

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: `/${EnumUserRole.ADMIN}`,
    name: EnumUserRole.ADMIN,
    component: () => import('src/layouts/AdminLayout.vue'),
    meta: { role: EnumUserRole.ADMIN },
    children: adminChildren,
  },
]
