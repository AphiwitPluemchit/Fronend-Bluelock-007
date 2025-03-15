import { EnumUserRole } from 'src/data/roles'
import type { RouteRecordRaw } from 'vue-router'

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: `/${EnumUserRole.ADMIN}`,
    name: EnumUserRole.ADMIN,
    component: () => import('src/layouts/AdminLayout.vue'),
    meta: { role: EnumUserRole.ADMIN },
    children: [
      {
        path: 'ActivitiesCalendar',
        component: () => import('pages/admin-page/calendar/ActivitiesCalendarPage.vue'),
      },
      {
        path: 'ActivitiesManagement',
        component: () => import('pages/admin-page/activity/ActivitiesTablePage.vue'),
      },
      {
        path: 'ActivitiesManagement/CreateActivity',
        component: () => import('pages/admin-page/activity/CreateActivity/CreateActivity.vue'),
      },
      {
        path: 'ActivitiesManagement/ActivityDetail/:id',
        component: () => import('pages/admin-page/activity/ActivityDetail/ActivityDetail.vue'),
      },
      {
        path: 'StudentManagement',
        component: () => import('pages/admin-page/student/StudentTablePage.vue'),
      },
      {
        path: 'StudentManagement/StudentDetail/:studentID',
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
      {
        path: 'ExComponent',
        component: () => import('pages/ExComponent.vue'),
      },
    ],
  },
]
