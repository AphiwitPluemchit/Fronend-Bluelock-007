import { route } from 'quasar/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

// 🧭 แยกกลุ่ม Route ตามสิทธิ์
import { publicRoutes } from './publicRoutes'
import { adminRoutes } from './adminRoutes'
import { studentRoutes } from './studentRoutes'

// 📌 รวมทั้งหมดเป็น Route เดียว
const routes: RouteRecordRaw[] = [
  ...publicRoutes,
  ...adminRoutes,
  ...studentRoutes,
  // fallback route
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorUnauthorized.vue'),
  },
]

export default route(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach((to, from, next) => {
    const auth = useAuthStore()
    auth.loadUserFromLocalStorage()
    const userRole = auth.getRole

    const isPublic = to.meta.public || false
    const requiredRole = to.meta.role

    // ✅ กรณีเป็นหน้า public → ผ่านได้เลย
    if (isPublic) {
      return next()
    }

    // ✅ ถ้า user ยังไม่ login → บันทึก path ที่จะไปไว้ก่อน แล้ว redirect ไป login
    if (!userRole) {
      if (!localStorage.getItem('redirectAfterLogin')) {
        localStorage.setItem('redirectAfterLogin', to.fullPath)
      }
      return next({ name: 'login' }) // <-- เปลี่ยนจาก '/' เป็นชื่อ route login จริง
    }

    // ✅ ถ้า role ไม่ตรงกับที่กำหนดไว้ → redirect ไป unauthorized
    if (requiredRole && requiredRole !== userRole) {
      return next('/unauthorized')
    }

    return next()
  })

  return Router
})
