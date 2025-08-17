/* eslint-disable @typescript-eslint/no-explicit-any */
// src/router/index.ts
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { EnumUserRole } from 'src/data/roles'
import { validateUrlParams } from 'src/utils/security'

// กลุ่ม route
import { publicRoutes } from './publicRoutes'
import { adminRoutes } from './adminRoutes'
import { studentRoutes } from './studentRoutes'
import { checkinoutRoutes } from './checkinoutRoutes'

// ติด scope ให้ทั้งกิ่ง (รวม children) เพื่อใช้ตรวจใน guard
type Scope = 'public' | 'checkinout' | 'admin' | 'student'
function tagScope(routes: RouteRecordRaw[], scope: Scope): RouteRecordRaw[] {
  return routes.map((r: RouteRecordRaw) => {
    const routeWithScope: RouteRecordRaw = {
      ...r,
      meta: { ...(r.meta || {}), scope },
    }

    if (r.children) {
      routeWithScope.children = tagScope(r.children, scope)
    }

    return routeWithScope
  })
}

const routes: RouteRecordRaw[] = [
  ...tagScope(publicRoutes, 'public'),
  ...tagScope(checkinoutRoutes, 'checkinout'),
  ...tagScope(adminRoutes, 'admin'),
  ...tagScope(studentRoutes, 'student'),
  // 404 (ถ้าโปรเจกต์มีอยู่แล้วข้ามได้)
  // {
  //   path: '/:catchAll(.*)*',
  //   name: 'not-found',
  //   meta: { scope: 'public' as Scope },
  //   component: () => import('pages/ErrorNotFound.vue'),
  // },
]

export default route(function () {
  const Router = createRouter({
    history: createWebHistory(process.env.VUE_ROUTER_BASE),
    routes,
    scrollBehavior: () => ({ left: 0, top: 0 }),
  })

  Router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    // ✅ ตรวจสอบความปลอดภัยของ URL parameters
    if (to.query && Object.keys(to.query).length > 0) {
      const queryParams: Record<string, string> = {}
      for (const [key, value] of Object.entries(to.query)) {
        if (typeof value === 'string') {
          queryParams[key] = value
        }
      }

      if (!validateUrlParams(queryParams)) {
        console.warn('Dangerous query parameters detected, redirecting to login')
        authStore.clearLocalStorage()
        return { path: '/' }
      }
    }

    // หา scope จาก route ที่ match ลึกสุด
    const matched = to.matched.findLast((m) => (m.meta as any)?.scope) ?? to.matched[0]
    const scope = (matched?.meta as { scope?: Scope })?.scope

    // public & checkinout เข้าได้ทุกคน
    if (scope === 'public' || scope === 'checkinout') return true

    // ตรวจสอบความถูกต้องของข้อมูล user ก่อน
    if (!authStore.validateUserData()) {
      console.warn('Invalid user data, logging out user')
      await authStore.logout()
      return false
    }

    // ตรวจ token หมดอายุ -> logout ทันที
    if (authStore.isTokenExpired()) {
      console.warn('Token expired, logging out user')
      await authStore.logout()
      return false
    }

    // ตรวจสอบสิทธิ์การเข้าถึง scope
    if (!authStore.canAccessScope(scope || '')) {
      console.warn('User cannot access this scope, logging out user')
      await authStore.logout()
      return false
    }

    // ตรวจสอบสิทธิ์การเข้าถึง path
    if (!authStore.canAccessPath(to.path)) {
      console.warn('User cannot access this path, redirecting to appropriate home')
      const role = authStore.getRole
      if (role === EnumUserRole.ADMIN) {
        return { path: '/Admin/ActivitiesCalendar' }
      } else if (role === EnumUserRole.STUDENT) {
        return { path: '/Student/ActivitiesCalendar' }
      }
      return false
    }

    return true
  })

  return Router
})

