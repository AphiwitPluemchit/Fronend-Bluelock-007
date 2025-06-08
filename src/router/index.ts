import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

// แยกกลุ่ม Route ตามสิทธิ์
import { publicRoutes } from './publicRoutes'
import { adminRoutes } from './adminRoutes'
import { studentRoutes } from './studentRoutes'
import { checkinoutRoutes } from './checkinoutRoutes' // ถ้ามี

// รวมทั้งหมดเป็น Route เดียว
const routes: RouteRecordRaw[] = [
  ...publicRoutes,
  ...adminRoutes,
  ...studentRoutes,
  ...checkinoutRoutes,
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorUnauthorized.vue'),
  },
]

export default route(function () {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHistory(), // ✅ ใช้ history mode โดยตรง
  })

  Router.beforeEach((to, from, next) => {
    const auth = useAuthStore()
    auth.loadUserFromLocalStorage()
    const userRole = auth.getRole

    const isPublic = to.meta.public || false
    const requiredRole = to.meta.role

    if (isPublic) return next()

    if (!userRole) {
      const redirectPath = to.fullPath
      localStorage.setItem('redirectAfterLogin', redirectPath)
      return next({ name: 'Login' })
    }

    if (requiredRole && requiredRole !== userRole) {
      return next('/unauthorized')
    }

    return next()
  })

  return Router
})
