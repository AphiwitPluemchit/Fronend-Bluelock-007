import { EnumUserRole } from 'src/data/roles'
import type { RouteRecordRaw } from 'vue-router'

const studentChildren: RouteRecordRaw[] = [
  {
    path: 'Home',
    component: () => import('pages/student-page/home/HomePage.vue'),
  },
  {
    path: 'ProgramCalendar',
    component: () => import('pages/student-page/calendar/ProgramCalendarPage.vue'),
  },
  {
    path: 'ProgramTablePage',
    component: () => import('pages/student-page/program/ProgramTablePage.vue'),
  },
  {
    path: 'Program/ProgramDetail/:id',
    component: () => import('pages/student-page/program/Detail/programDetailPage.vue'),
  },
  {
    path: 'MyProgramPage',
    component: () => import('pages/student-page/myprogram/MyProgramPage.vue'),
  },
  {
    path: 'Program/MyProgramDetail/:id/:tab?',
    name: 'MyProgramDetail',
    component: () => import('pages/student-page/myprogram/Detail/programDetailPage.vue'),
  },
  {
    path: 'RecordPage',
    component: () => import('pages/student-page/record/RecordPage.vue'),
  },
  {
    path: 'UploadCertificate/:courseId?',
    component: () => import('pages/student-page/certificate/UploadCertificate.vue'),
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
