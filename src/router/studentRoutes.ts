import { EnumUserRole } from 'src/data/roles'
import type { RouteRecordRaw } from 'vue-router'

const studentChildren: RouteRecordRaw[] = [
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
    path: 'Activity/MyActivityDetail/:id/:tab?',
    name: 'MyActivityDetail',
    component: () => import('pages/student-page/myactivity/Detail/ActivityDetailPage.vue'),
  },
  {
    path: 'RecordPage',
    component: () => import('pages/student-page/record/RecordPage.vue'),
  },
  {
    path: 'CertificatePage',
    component: () => import('pages/student-page/certificate/CertificatePage.vue'),
  },
  {
    path: 'OnlineCoursesPage',
    component: () => import('pages/student-page/online-courses/OnlineCoursesPage.vue'),
  },
].map((route) => ({
  ...route,
  meta: { role: EnumUserRole.STUDENT },
}))

export const studentRoutes: RouteRecordRaw[] = [
  {
    path: `/${EnumUserRole.STUDENT}`,
    name: EnumUserRole.STUDENT,
    component: () => import('src/layouts/StudentLayout.vue'),
    meta: { role: EnumUserRole.STUDENT },
    children: studentChildren,
  },
]
