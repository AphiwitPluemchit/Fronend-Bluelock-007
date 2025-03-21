import { EnumUserRole } from 'src/data/roles'
import type { RouteRecordRaw } from 'vue-router'

export const studentRoutes: RouteRecordRaw[] = [
  {
    path: `/${EnumUserRole.STUDENT}`,
    name: EnumUserRole.STUDENT,
    component: () => import('src/layouts/StudentLayout.vue'),
    meta: { role: EnumUserRole.STUDENT },
    children: [
      {
        path: 'ActivitiesCalendar',
        component: () => import('pages/student-page/calendar/ActivitiesCalendarPage.vue'),
      },
      {
        path: 'ActivityTablePage',
        component: () => import('pages/student-page/activity/ActivityTablePage.vue'),
      },
      {
        path: 'Activity/ActivityDetail/:id',
        component: () => import('pages/student-page/activity/Detail/ActivityDetailPage.vue'),
      },
      {
        path: 'MyActivitiesPage',
        component: () => import('pages/student-page/myactivity/MyActivitiesPage.vue'),
      },
      {
        path: 'RecordPage',
        component: () => import('pages/student-page/record/RecordPage.vue'),
      },
      {
        path: 'CertificateTablePage',
        component: () => import('pages/student-page/certificate/CertificateTablePage.vue'),
      },
    ],
  },
]
