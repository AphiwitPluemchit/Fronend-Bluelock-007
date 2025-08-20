// src/boot/axios.ts
import { boot } from 'quasar/wrappers'
import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { Loading, QSpinnerOval } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

/* ------------------ Instance ------------------ */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 300000,
  headers: { 'Content-Type': 'application/json' },
})

/* ------------------ Global Loading ------------------ */
let inflight = 0
const skip = (cfg?: AxiosRequestConfig) =>
  cfg?.headers?.['X-Skip-Loading'] === 'true' ||
  cfg?.headers?.['x-skip-loading'] === 'true'

const start = () => {
  Loading.show({
    message: 'กำลังโหลด...',
    spinner: QSpinnerOval,
  })
}
const stop = () => Loading.hide()

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  if (!skip(config)) {
    inflight++
    if (inflight === 1) start()
  }
  return config
})

/* ------------------ Error Extract Helper ------------------ */
type ErrorBody = { error?: string; message?: string }

function extractBackendMessage(err: AxiosError): string {
  const data = err.response?.data

  // กรณี backend ส่งเป็น string (เช่น text/plain หรือ JSON string)
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data) as ErrorBody
      return parsed.error || parsed.message || data
    } catch {
      return data
    }
  }

  // กรณี backend ส่งเป็น JSON object
  if (data && typeof data === 'object') {
    const body = data as ErrorBody
    return body.error || body.message || err.message || 'เกิดข้อผิดพลาด'
  }

  return err.message || 'เกิดข้อผิดพลาด'
}

/* ------------------ Response Interceptor ------------------ */
let isHandling401 = false

export default boot(({ app, router }) => {
  api.interceptors.response.use(
    (res: AxiosResponse) => {
      if (!skip(res.config)) {
        inflight = Math.max(0, inflight - 1)
        if (inflight === 0) stop()
      }
      return res
    },
    async (error: AxiosError) => {
      const cfg = error.config
      const status = error.response?.status

      if (!skip(cfg)) {
        inflight = Math.max(0, inflight - 1)
        if (inflight === 0) stop()
      }

      const skipAuthRedirect =
        cfg?.headers?.['X-Skip-Auth-Redirect'] === 'true' ||
        cfg?.headers?.['x-skip-auth-redirect'] === 'true'

      // Handle 401 → clear token + redirect
      if (status === 401 && !skipAuthRedirect) {
        if (isHandling401) return Promise.reject(error)
        isHandling401 = true
        try {
          const auth = useAuthStore()
          const isOnLogin = router.currentRoute.value.name === 'Login'
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

      // ✅ ดึงข้อความจาก backend มาใส่ใน error.message
      const backendMsg = extractBackendMessage(error)
      ;(error as AxiosError & { backendMessage?: string }).backendMessage = backendMsg
      error.message = backendMsg

      return Promise.reject(error)
    }
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }

