import { route } from 'quasar/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'src/stores/auth'

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

    if (isPublic) {
      return next()
    }

    if (!userRole && !isPublic) {
      return next('/') // redirect to login
    }

    if (requiredRole && requiredRole !== userRole) {
      return next('/unauthorized') // redirect if role mismatch
    }

    return next()
  })

  return Router
})
