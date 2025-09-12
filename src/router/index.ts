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

  Router.beforeEach((to) => {
    const authStore = useAuthStore()

    // Basic query safety
    if (to.query && Object.keys(to.query).length > 0) {
      const queryParams: Record<string, string> = {}
      for (const [key, value] of Object.entries(to.query)) {
        if (typeof value === 'string') queryParams[key] = value
      }
      if (!validateUrlParams(queryParams)) {
        authStore.clearLocalStorage()
        return { path: '/' }
      }
    }

    // Detect scope
    const matched = to.matched.findLast((m) => (m.meta as any)?.scope) ?? to.matched[0]
    const scope = (matched?.meta as { scope?: Scope })?.scope

    // Public and checkinout routes are allowed to load; checkinout may require auth on page logic
    if (scope === 'public') return true

    // If not authenticated, redirect to login and preserve intended path
    const isAuthed = authStore.getIsAuthenticated
    if (!isAuthed) {
      const redirect = to.fullPath
      localStorage.setItem('redirectAfterLogin', redirect)
      return { name: 'Login', query: { redirect } }
    }

    // Authenticated: enforce role vs scope
    const role = authStore.getRole
    if (!role) return { name: 'Login' }

    if (scope === 'admin' && role !== EnumUserRole.ADMIN) {
      return { path: '/Admin/ProgramCalendar' }
    }
    if (scope === 'student' && role !== EnumUserRole.STUDENT) {
      return { path: '/Student/ProgramCalendar' }
    }

    // checkinout scope: any authenticated student allowed
    if (scope === 'checkinout' && role !== EnumUserRole.STUDENT) {
      return { path: '/Student/ProgramCalendar' }
    }

    return true
  })

  return Router
})
