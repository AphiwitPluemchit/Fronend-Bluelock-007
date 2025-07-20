import { defineStore } from 'pinia'
import AuthService from 'src/services/auth'
import type { Auth } from 'src/types/auth'
import type { User } from 'src/types/user'
import { EnumUserRole } from 'src/data/roles'
import { useRouter } from 'vue-router'

export interface AuthState {
  form: {
    email: string
    password: string
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    form: {
      email: '',
      password: '',
    },
  }),

  getters: {
    // ✅ ดึง token จาก localStorage
    getAccessToken: (): string | null => localStorage.getItem('access_token'),

    // ✅ ดึง user จาก localStorage แล้ว parse
    getUser: (): Partial<User> | null => {
      const user = localStorage.getItem('user')
      console.log('user', user)

      return user ? JSON.parse(user) : null
    },

    getRole(): EnumUserRole | undefined {
      return this.getUser?.role
    },

    isAdmin(): boolean {
      return this.getUser?.role === EnumUserRole.ADMIN
    },

    isStudent(): boolean {
      return this.getUser?.role === EnumUserRole.STUDENT
    },

    getName(): string {
      const user = this.getUser
      return user?.name || 'ไม่ระบุ'
    },

    // เพิ่ม getter ใหม่
    getStudentYear(): number | undefined {
      return this.getUser?.studentYear
    },

    getMajor(): string | undefined {
      return this.getUser?.major
    },

    getLastLogin(): string | undefined {
      return this.getUser?.lastLogin
    },
  },

  actions: {
    // ✅ Login: แยกเก็บ token กับ user
    async login(): Promise<Auth | null> {
      try {
        const data = await AuthService.login(this.form.email, this.form.password)
        if (data?.token && data?.user) {
          console.log('Login successful:', data.user)

          // เก็บ token และ user
          localStorage.setItem('access_token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))

          // เคลีย form
          this.form.email = ''
          this.form.password = ''

          return data
        }
        return null
      } catch (err) {
        console.error('Login error:', err)
        throw new Error('เข้าสู่ระบบไม่สำเร็จ')
      }
    },

    // ✅ Logout: ลบ token และ user
    async logout(): Promise<void> {
      try {
        const user = this.getUser
        if (user?.id) {
          // เรียก API logout
          await AuthService.logout(user.id)
        }
      } catch (err) {
        console.warn('Logout failed silently:', err)
      } finally {
        // เคลีย localStorage ไม่ว่าจะ API สำเร็จหรือไม่
        this.clearLocalStorage()

        // Redirect ไปหน้า login
        const router = useRouter()
        await router.push('/')
      }
    },

    // ✅ เคลีย localStorage
    clearLocalStorage(): void {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      localStorage.removeItem('redirectAfterLogin')
    },

    // ✅ โหลดใหม่หลังรีเฟรช (ไม่มี state แต่ไว้ใช้ใน future)
    loadUserFromLocalStorage() {
      // ไม่ต้อง set state แล้ว เพราะใช้จาก localStorage ตรง ๆ
      // ฟังก์ชันนี้เอาไว้ future ถ้าคุณอยากเก็บ user ใน state ชั่วคราว
    },

    // ✅ ตรวจสอบ token expiry
    isTokenExpired(): boolean {
      const token = this.getAccessToken
      if (!token) return true

      try {
        // Decode JWT token เพื่อดู expiry (ไม่ต้อง verify signature)
        const parts = token.split('.')
        if (parts.length !== 3) return true

        const payload = JSON.parse(atob(parts[1] as string))
        const expiry = payload.exp * 1000 // แปลงเป็น milliseconds
        return Date.now() >= expiry
      } catch {
        return true
      }
    },
  },
})
