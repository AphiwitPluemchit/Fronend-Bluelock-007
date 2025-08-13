// src/boot/axios.ts
import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { useAuthStore } from 'src/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  const token = localStorage.getItem('access_token')

  if (auth.isTokenExpired()) {
    auth.clearLocalStorage()
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isHandling401 = false

export default boot(({ app, router }) => {
  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const status = error?.response?.status
      const reqConfig = error?.config
      const skipAuthRedirect =
        reqConfig?.headers?.['X-Skip-Auth-Redirect'] === 'true' ||
        reqConfig?.headers?.['x-skip-auth-redirect'] === 'true'

      if (status === 401 && !skipAuthRedirect) {
        if (isHandling401) return Promise.reject(new Error(error))
        isHandling401 = true
        try {
          const auth = useAuthStore()
          const isOnLogin = router.currentRoute.value.name === 'login'
          try { await auth.logout() } catch {
            // ignored
          }

          if (!isOnLogin) {
            const redirect = router.currentRoute.value.fullPath

            // ✅ ถ้ามี route ชื่อ 'login' ใช้ชื่อนั้น
            if (typeof router.hasRoute === 'function' && router.hasRoute('Login')) {
              await router.replace({ name: 'Login', query: { redirect } })
            } else {
              // ✅ fallback: ใช้ path '/login' (ต้องมี route path นี้)
              await router.replace({ path: '/Login', query: { redirect } }).catch(async () => {
                // ตัวกันสุดท้าย (กันแอปติดหน้าเดิม)
                await router.replace('/')
              })
            }
          }
        } finally {
          isHandling401 = false
        }
      }

      // อย่าห่อ error ทิ้งข้อมูล
      return Promise.reject(new Error(error))
    }
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
