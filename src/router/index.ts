/* eslint-disable @typescript-eslint/no-explicit-any */
// src/router/index.ts
import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { EnumUserRole } from 'src/data/roles'

// กลุ่ม route
import { publicRoutes } from './publicRoutes'
import { adminRoutes } from './adminRoutes'
import { studentRoutes } from './studentRoutes'
import { checkinoutRoutes } from './checkinoutRoutes'

// ติด scope ให้ทั้งกิ่ง (รวม children) เพื่อใช้ตรวจใน guard
type Scope = 'public' | 'checkinout' | 'admin' | 'student'
function tagScope(routes: RouteRecordRaw[], scope: Scope): RouteRecordRaw[] {
  return routes.map((r: RouteRecordRaw) => ({
    ...(r as any), // Cast to any to bypass strict type checking for children property
    meta: { ...(r.meta || {}), scope },
    children: r.children ? tagScope(r.children, scope) : r.children,
  }))
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

    // หา scope จาก route ที่ match ลึกสุด
    const matched = to.matched.findLast((m) => (m.meta as any)?.scope) ?? to.matched[0]
    const scope = (matched?.meta as { scope?: Scope })?.scope

    // public & checkinout เข้าได้ทุกคน
    if (scope === 'public' || scope === 'checkinout') return true

    // ตรวจ token หมดอายุ -> logout ทันที
    if (authStore.isTokenExpired()) {
      await authStore.logout()
      return false
    }

    const role = authStore.getRole // ดึงจาก localStorage ผ่าน getter ใน store

    // ไม่มี role หรือ scope ผิดปกติ -> logout
    if (!role || !scope) {
      await authStore.logout()
      return false
    }

    // กฎเข้าถึง
    const adminOK = role === EnumUserRole.ADMIN && scope === 'admin'
    const studentOK = role === EnumUserRole.STUDENT && scope === 'student'

    if (adminOK || studentOK) return true

    // ไม่ตรงสิทธิ์ -> logout
    await authStore.logout()
    return false
  })

  return Router
})
