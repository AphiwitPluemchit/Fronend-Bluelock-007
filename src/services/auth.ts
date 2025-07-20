import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { Auth } from 'src/types/auth'
import type { AxiosError } from 'axios'

// 📌 Utility แสดงข้อความผิดพลาด
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

// 📌 Utility แสดงข้อความสำเร็จ
const showSuccess = (message: string) => {
  Notify.create({
    message,
    type: 'positive',
    position: 'bottom',
    timeout: 3000,
  })
}

class AuthService {
  static async login(email: string, password: string): Promise<Auth | null> {
    try {
      const res = await api.post<Auth>('/auth/login', { email, password })

      if (res.data?.message) {
        showSuccess(res.data.message)
      }

      return res.data
    } catch (error) {
      // Handle specific error codes from backend
      const axiosError = error as AxiosError<{ code: string; error: string; remainingTime?: number }>
      if (axiosError.response?.data?.code) {
        const errorCode = axiosError.response.data.code
        const errorMessage = axiosError.response.data.error || 'เกิดข้อผิดพลาด'

        console.log('Error code:', errorCode, 'Message:', errorMessage)

        switch (errorCode) {
          case 'MISSING_CREDENTIALS':
            showError('กรุณากรอกอีเมลและรหัสผ่าน')
            break
          case 'INVALID_CREDENTIALS':
            showError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
            break
          case 'RATE_LIMITED': {
            const remainingTime = axiosError.response?.data?.remainingTime || 0
            const minutes = Math.floor(remainingTime / 60)
            const seconds = remainingTime % 60
            showError(`เข้าสู่ระบบบ่อยเกินไป กรุณารอ ${minutes} นาที ${seconds} วินาที`)
            break
          }
          case 'TOKEN_ERROR':
            showError('เกิดข้อผิดพลาดในการสร้าง token')
            break
          default:
            showError(errorMessage)
        }
      } else {
        showError('เข้าสู่ระบบล้มเหลว กรุณาตรวจสอบการเชื่อมต่อ')
      }

      console.error('Login failed:', error)
      return null
    }
  }

  static async logout(userId: string): Promise<boolean> {
    try {
      const res = await api.post(`/auth/logout/${userId}`)

      if (res.data?.message) {
        showSuccess(res.data.message)
      }

      return true
    } catch (error) {
      // แม้ logout API ล้มเหลว ก็ให้เคลีย localStorage
      console.warn('Logout API failed:', error)
      return false
    }
  }

  static async fetchProfile(): Promise<Auth | null> {
    try {
      const { data } = await api.get<Auth>('/auth/profile')
      return data || null
    } catch (err) {
      showError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')
      console.error('Fetch profile failed:', err)
      return null
    }
  }
}

export default AuthService
