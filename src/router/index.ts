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
      meta: {
        ...(r.meta || {}),
        scope: r.meta?.scope || scope,
      },
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
]

export default route(function () {
  const Router = createRouter({
    history: createWebHistory(process.env.VUE_ROUTER_BASE),
    routes,
    scrollBehavior: () => ({ left: 0, top: 0 }),
  })

  Router.beforeEach(async (to) => {
    console.log('🚀 [Router] Navigating to:', to.path)
    const authStore = useAuthStore()

    // Basic query safety
    if (to.query && Object.keys(to.query).length > 0) {
      const queryParams: Record<string, string> = {}
      for (const [key, value] of Object.entries(to.query)) {
        if (typeof value === 'string') queryParams[key] = value
      }
      if (!validateUrlParams(queryParams)) {
        console.error('❌ [Router] Invalid query parameters detected')
        authStore.clearLocalStorage()
        return { path: '/' }
      }
    }

    // Detect scope
    const matched = to.matched.findLast((m) => (m.meta as any)?.scope) ?? to.matched[0]
    const scope = (matched?.meta as { scope?: Scope })?.scope
    console.log('📍 [Router] Route scope:', scope)

    // Public routes are always allowed
    if (scope === 'public') {
      console.log('✅ [Router] Public route - allowing access')
      return true
    }

    // ✅ Checkinout scope: ต้องรอ ensureAuthenticated ก่อน (เพื่อให้ refresh หน้าได้)
    if (scope === 'checkinout') {
      console.log('🔐 [Router] Checkinout scope - ensuring authentication...')

      // รอให้ authStore โหลดข้อมูล authentication จาก localStorage/token
      const isAuthed = await authStore.ensureAuthenticated()

      if (isAuthed) {
        const role = authStore.getRole
        console.log('✅ [Router] User authenticated with role:', role)
        // ถ้าเป็น student ให้ผ่าน
        if (role === EnumUserRole.STUDENT) {
          return true
        } else {
          console.warn('⚠️  [Router] User is not a student')
        }
      } else {
        console.warn('⚠️  [Router] User not authenticated')
      }

      // ถ้ายังไม่ login หรือไม่ใช่ student ให้ redirect ไป login
      console.log('🔄 [Router] Redirecting to login...')
      const redirect = to.fullPath
      localStorage.setItem('redirectAfterLogin', redirect)
      return { name: 'Login', query: { redirect } }
    }

    // Try to ensure authentication (will refresh token if needed)
    console.log('🔐 [Router] Ensuring authentication for protected route...')
    const isAuthed = await authStore.ensureAuthenticated()
    if (!isAuthed) {
      console.warn('⚠️  [Router] Authentication failed - redirecting to login')
      const redirect = to.fullPath
      localStorage.setItem('redirectAfterLogin', redirect)
      return { name: 'Login', query: { redirect } }
    }

    // Authenticated: enforce role vs scope
    const role = authStore.getRole
    console.log('✅ [Router] User authenticated with role:', role)
    if (!role) {
      console.error('❌ [Router] No role found - redirecting to login')
      return { name: 'Login' }
    }

    if (scope === 'admin' && role !== EnumUserRole.ADMIN) {
      console.warn('⚠️  [Router] Non-admin trying to access admin route')
      return { path: '/Admin/ProgramCalendar' }
    }
    if (scope === 'student' && role !== EnumUserRole.STUDENT) {
      console.warn('⚠️  [Router] Non-student trying to access student route')
      return { path: '/Student/Home' }
    }

    console.log('✅ [Router] Access granted')
    return true
  })

  return Router
})
