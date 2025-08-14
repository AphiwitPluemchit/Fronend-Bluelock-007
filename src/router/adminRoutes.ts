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
    path: 'ActivitiesManagement/ActivityDetail/:id/:tab?',
    name: 'ActivityDetail',
    component: () => import('src/pages/admin-page/activity/ActivityDetail/ActivityDetailPage.vue'),
  },
  {
    path: 'StudentManagement',
    component: () => import('pages/admin-page/student/StudentManagement/StudentTablePage.vue'),
  },
  {
    path: 'StudentManagement/UploadStudent',
    component: () =>
      import('pages/admin-page/student/StudentManagement/StudentDetail/UploadStudentPage.vue'),
  },
  {
    path: 'StudentStorage',
    component: () => import('src/pages/admin-page/student/StudentStorage/StudentStoragePage.vue'),
  },
  {
    path: 'StudentStorage/ConfirmStudentDataPage',
    component: () =>
      import('src/pages/admin-page/student/StudentStorage/ConfirmStudentDataPage.vue'),
  },
  {
    path: 'StudentInternship',
    component: () => import('src/pages/admin-page/student/StudentInternship/StudentInternshipPage.vue'),
  },
  {
    path: 'StudentInternship/ConfirmStudentDataPage',
    component: () =>
      import('src/pages/admin-page/student/StudentStorage/ConfirmStudentDataPage.vue'),
  },
  {
    path: 'StudentManagement/StudentDetail/:code',
    component: () =>
      import('pages/admin-page/student/StudentManagement/StudentDetail/StudentDetailPage.vue'),
  },
  {
    path: 'Report',
    component: () => import('pages/admin-page/report/ReportPage.vue'),
  },
  {
    path: 'CourseTablePage',
    component: () => import('pages/admin-page/certificate/CourseTablePage.vue'),
  },
  {
    path: 'AddCourse',
    name: 'AddCourse',
    component: () => import('pages/admin-page/certificate/AddCoursePage.vue'),
  },
  {
    path: 'ManageCertificateTable',
    component: () => import('pages/admin-page/certificate/ManageCertificateTable.vue'),
  },
  {
    path: 'CourseDetail/:id',
    component: () => import('pages/admin-page/certificate/CourseDetailPage.vue'),
    props: true,
  },
  // Forms routes for admins
  {
    path: 'forms',
    component: () => import('pages/admin-page/forms/FormsListPage.vue'),
  },
  {
    path: 'forms/builder',
    component: () => import('pages/admin-page/forms/FormBuilderPage.vue'),
  },
  {
    path: 'forms/builder/:id',
    component: () => import('pages/admin-page/forms/FormBuilderPage.vue'),
  },
  {
    path: 'forms/:id/submissions',
    component: () => import('pages/admin-page/forms/FormSubmissionsPage.vue'),
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
