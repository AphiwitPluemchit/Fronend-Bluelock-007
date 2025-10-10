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
      console.log('🚀 AuthService.login called with:', {
        email,
        passwordLength: password?.length || 0,
      })
      console.log('🌐 API URL:', import.meta.env.VITE_API_URL)

      const res = await api.post<Auth>('/auth/login', { email, password })
      console.log('📡 API Response:', res)
      console.log('📊 Response data:', res.data)

      if (res.data?.message) {
        showSuccess(res.data.message)
      }

      return res.data
    } catch (error) {
      console.error('💥 AuthService login error:', error)

      // Handle specific error codes from backend
      const axiosError = error as AxiosError<{
        code: string
        error: string
        remainingTime?: number
      }>
      if (axiosError.response?.data?.code) {
        const errorCode = axiosError.response.data.code
        const errorMessage = axiosError.response.data.error || 'เกิดข้อผิดพลาด'

        console.log('🚨 Error code:', errorCode, 'Message:', errorMessage)

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
        console.error('🚨 No error code in response:', axiosError.response)
        showError('เข้าสู่ระบบล้มเหลว กรุณาตรวจสอบการเชื่อมต่อ')
      }

      console.error('Login failed:', error)
      return null
    }
  }

  // google OAuth login handled separately in LoginPage.vue
  static async loginWithGoogle(): Promise<void> {
    try {
      const res = await api.get<{ url: string }>('/auth/google')

      if (res.data?.url) {
        window.location.href = res.data.url
      } else {
        showError('ไม่สามารถรับ URL สำหรับเข้าสู่ระบบด้วย Google ได้')
        console.error('No URL in response data:', res.data)
      }
    } catch (error) {
      console.error('💥 AuthService loginWithGoogle error:', error)
      showError('เข้าสู่ระบบด้วย Google ล้มเหลว กรุณาตรวจสอบการเชื่อมต่อ')
    }
  }

  static async logout(userId: string): Promise<boolean> {
    try {
      console.log('🚪 AuthService.logout called for user:', userId)
      console.log('🌐 API URL:', import.meta.env.VITE_API_URL)
      console.log('🎫 Token exists:', !!localStorage.getItem('access_token'))

      // Backend logout endpoint: /auth/logout
      // Backend now uses JWT middleware, so userId is extracted from token
      // No need to send userId in request body
      const res = await api.post('/auth/logout')

      console.log('📡 Logout API Response:', res)
      console.log('📊 Response data:', res.data)

      if (res.data?.message) {
        showSuccess(res.data.message)
      }

      console.log('✅ Logout API call successful')
      return true
    } catch (error) {
      console.error('💥 AuthService logout error:', error)

      // Handle specific error types
      const axiosError = error as AxiosError<{ status: number; data: Record<string, unknown> }>

      if (axiosError.response) {
        const status = axiosError.response.status
        const data = axiosError.response.data

        console.log('🚨 Logout failed with status:', status)
        console.log('🚨 Error data:', data)

        switch (status) {
          case 401:
            console.warn('⚠️ Unauthorized - token may be invalid or expired')
            break
          case 404:
            console.warn('⚠️ Logout endpoint not found - check backend configuration')
            break
          case 500:
            console.warn('⚠️ Backend server error during logout')
            break
          default:
            console.warn('⚠️ Logout failed with status:', status)
        }
      } else if (axiosError.request) {
        console.warn('⚠️ No response received - network or backend issue')
      } else {
        console.warn('⚠️ Logout request setup failed:', axiosError.message)
      }

      // Return true to indicate logout was handled (even if API failed)
      // This prevents the logout process from breaking
      return true
    }
  }

  // ✅ ดึงข้อมูลโปรไฟล์ผู้ใช้จาก /auth/me
  static async getProfile(): Promise<Auth | null> {
    try {
      console.log('🔍 AuthService.getProfile called')
      console.log('🎫 Token exists:', !!localStorage.getItem('access_token'))

      const res = await api.get<Auth>('/auth/me')
      console.log('📡 Profile API Response:', res)
      console.log('📊 Profile data:', res.data)

      return res.data || null
    } catch (error) {
      console.error('💥 AuthService getProfile error:', error)

      const axiosError = error as AxiosError<{ status: number }>
      if (axiosError.response?.status === 401) {
        console.warn('⚠️ Unauthorized - token may be invalid or expired')
        // ไม่ต้อง showError เพราะ interceptor จะจัดการ
      } else {
        showError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')
      }

      return null
    }
  }

  // Deprecated: ใช้ getProfile() แทน
  static async fetchProfile(): Promise<Auth | null> {
    return this.getProfile()
  }
}

export default AuthService
