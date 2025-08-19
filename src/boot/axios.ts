// src/boot/axios.ts
import { boot } from 'quasar/wrappers'
import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { Loading, QSpinnerOval } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

/* -------- Global Loading: start on request, stop on finish -------- */
let inflight = 0
const skip = (cfg?: AxiosRequestConfig) =>
  cfg?.headers?.['X-Skip-Loading'] === 'true' || cfg?.headers?.['x-skip-loading'] === 'true'

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
    if (inflight === 1) start() // เริ่มโหลดทันทีเมื่อมีรีเควสต์แรก
  }
  return config
})

let isHandling401 = false

export default boot(({ app, router }) => {
  api.interceptors.response.use(
    (res: AxiosResponse) => {
      if (!skip(res.config)) {
        inflight = Math.max(0, inflight - 1)
        if (inflight === 0) stop() // รีเควสต์สุดท้ายจบ -> ปิดโหลดทันที
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

      if (status === 401 && !skipAuthRedirect) {
        if (isHandling401) return Promise.reject(new Error('Already handling 401'))
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
              try { await router.replace({ path: '/', query: { redirect } }) }
              catch { await router.replace('/') }
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
