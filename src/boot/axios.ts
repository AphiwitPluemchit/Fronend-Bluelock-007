import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // กำหนด timeout
  headers: {
    'Content-Type': 'application/json',
  },
})
api.interceptors.request.use((config) => {
  const userPayload = localStorage.getItem('userPayload')
  if (userPayload) {
    const parsed = JSON.parse(userPayload)
    const token = parsed.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})
export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
