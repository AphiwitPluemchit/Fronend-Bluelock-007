import { defineRouter } from '#q-app/wrappers'
import {
  createMemoryHistory,
  createWebHashHistory,
  createWebHistory,
  createRouter,
} from 'vue-router'
import routes from './routes'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    history: createHistory(process.env.VUE_ROUTER_BASE),
    routes,
    scrollBehavior: () => ({ left: 0, top: 0 }),
  })

  // การใช้ router guard เพื่อตรวจสอบสถานะการล็อกอิน
  Router.beforeEach((to, from, next) => {
    const isLoggedIn = localStorage.getItem('user-token') !== null // เช็ค token ว่าผู้ใช้ล็อกอินหรือยัง

    // ถ้าหน้านั้นต้องการการล็อกอิน และผู้ใช้ไม่ได้ล็อกอิน
    if (to.meta.requiresAuth && !isLoggedIn) {
      next({ name: 'Login' }) // ไปที่หน้า Login
    } else {
      next() // ไปยังหน้าที่ต้องการ
    }
  })

  return Router
})
