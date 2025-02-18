import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: () => import('layouts/AdminLayout.vue'),
    children: [{ path: '', component: () => import('pages/login-page/LoginPage.vue') }],
  },
  {
    path: '/ActivitiesCalendar',
    name: 'ActivitiesCalendar',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', component: () => import('pages/admin-page/calendar/ActivitiesCalendarPage.vue') },
    ],
  },
  {
    path: '/ActivitiesManagement',
    name: 'ActivitiesManagement',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', component: () => import('pages/admin-page/activity/ActivitiesTablePage.vue') },
    ],
  },
  {
    path: '/StudentManagement',
    name: 'StudentManagement',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', component: () => import('pages/admin-page/student/StudentTablePage.vue') },
    ],
  },
  {
    path: '/Report',
    name: 'Report',
    component: () => import('layouts/AdminLayout.vue'),
    children: [{ path: '', component: () => import('pages/admin-page/report/ReportPage.vue') }],
  },
  {
    path: '/CertificateManagement',
    name: 'CertificateManagement',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/admin-page/certificate/CertificateTablePage.vue'),
      },
    ],
  },
  {
    path: '/ActivitiesCalendarPage',
    name: 'ActivitiesCalendarPage',
    component: () => import('layouts/StudentLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/student-page/calendar/ActivitiesCalendarPage.vue'),
      },
    ],
  },
  {
    path: '/ActivitiesTablePage',
    name: 'ActivitiesTablePage',
    component: () => import('layouts/StudentLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/student-page/activity/ActivitiesTablePage.vue'),
      },
    ],
  },
  {
    path: '/MyActivitiesPage',
    name: 'MyActivitiesPage',
    component: () => import('layouts/StudentLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/student-page/myactivity/MyActivitiesPage.vue'),
      },
    ],
  },
  {
    path: '/RecordPage',
    name: 'RecordPage',
    component: () => import('layouts/StudentLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/student-page/record/RecordPage.vue'),
      },
    ],
  },
  {
    path: '/CertificateTablePage',
    name: 'CertificateTablePage',
    component: () => import('layouts/StudentLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/student-page/certificate/CertificateTablePage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
]

export default routes
