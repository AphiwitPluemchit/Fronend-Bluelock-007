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

  // ✅ ข้ามการตรวจสอบสำหรับ login request
  if (config.url === '/auth/login') {
    console.log('🔐 Login request detected, skipping validation')
    return config
  }

  // ตรวจสอบความถูกต้องของข้อมูล user ก่อนส่ง request (เฉพาะ non-login requests)
  if (!auth.validateUserData()) {
    console.warn('Invalid user data detected in request interceptor')
    auth.clearLocalStorage()
    // ไม่ส่ง request และ return error
    return Promise.reject(new Error('Invalid user data'))
  }

  if (auth.isTokenExpired()) {
    console.warn('Token expired in request interceptor')
    auth.clearLocalStorage()
    return Promise.reject(new Error('Token expired'))
  }

  if (token) {
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
        if (isHandling401) return Promise.reject(new Error('Already handling 401'))
        isHandling401 = true

        try {
          const auth = useAuthStore()
          const isOnLogin = router.currentRoute.value.name === 'Login'

          // Clear authentication data
          auth.clearLocalStorage()

          if (!isOnLogin) {
            const redirect = router.currentRoute.value.fullPath

            // Redirect to login page
            try {
              await router.replace({ name: 'Login', query: { redirect } })
            } catch (routerError) {
              console.warn('Router redirect failed, using fallback:', routerError)
              // Fallback to path-based redirect
              try {
                await router.replace({ path: '/', query: { redirect } })
              } catch (fallbackError) {
                console.error('Fallback redirect also failed:', fallbackError)
                // Last resort - go to root
                await router.replace('/')
              }
            }
          }
        } finally {
          isHandling401 = false
        }
      }

      return Promise.reject(new Error(error?.message || 'Request failed'))
    }
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
