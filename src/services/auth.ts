import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { Auth } from 'src/types/auth'

// 📌 Utility แสดงข้อความผิดพลาด
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

class AuthService {
  static async login(email: string, password: string) {
    try {
      const res = await api.post<Auth>('/auth/login', { email, password })
      return res.data
    } catch (error) {
      showError('เข้าสู่ระบบล้มเหลว กรุณาตรวจสอบอีเมลหรือรหัสผ่าน')
      console.error('Login failed:', error)
    }
  }

  static async logout(userId: number): Promise<void> {
    try {
      await api.post(`/auth/logout/${userId}`)
      localStorage.removeItem('userPayload')
      window.location.href = '/login'
    } catch (error) {
      showError('ออกจากระบบล้มเหลว')
      console.error('Logout failed:', error)
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
