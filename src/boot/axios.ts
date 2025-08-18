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
  const token = localStorage.getItem('access_token')
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
            try {
              await router.replace({ name: 'Login', query: { redirect } })
            } catch {
              try {
                await router.replace({ path: '/', query: { redirect } })
              } catch {
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
