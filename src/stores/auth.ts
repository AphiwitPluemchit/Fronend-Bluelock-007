import { defineStore } from 'pinia'
import AuthService from 'src/services/auth'
import type { Auth } from 'src/types/auth'
import type { User } from 'src/types/user'
import { EnumUserRole } from 'src/data/roles'
// ❌ ห้ามใช้ useRouter() ที่ไฟล์ store (นอก setup)
// ✅ ใช้ router instance แทน

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
    getAccessToken: (): string | null => localStorage.getItem('access_token'),

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
    async login(): Promise<Auth | null> {
      try {
        const data = await AuthService.login(this.form.email, this.form.password)
        if (data?.token && data?.user) {
          console.log('Login successful:', data.user)
          localStorage.setItem('access_token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          return data
        }
        return null
      } catch (err) {
        console.error('Login error:', err)
        throw new Error('เข้าสู่ระบบไม่สำเร็จ')
      }
    },

    // ✅ ปรับ logout: เคลียร์ session อย่างเดียว
    //    ส่วน "redirect ไป login" ให้ response interceptor เป็นคนทำ
    async logout(): Promise<void> {
      console.log('logout')
      try {
        const user = this.getUser
        if (user?.id) {
          // กันลูป 401 ด้วย header บอก interceptor ว่า "ข้าม redirect"
          await AuthService.logout(user.id)
        }
      } catch (err) {
        console.warn('Logout failed silently:', err)
      }
      this.clearLocalStorage()
      // ❌ ไม่ push/replace ที่นี่ เพื่อกันชนกับ interceptor
      console.log('/logout done (no redirect here)')
    },

    clearLocalStorage(): void {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      localStorage.removeItem('redirectAfterLogin')
    },

    clearForm(): void {
      this.form.email = ''
      this.form.password = ''
    },

    loadUserFromLocalStorage() {
      // reserved for future use
    },

    isTokenExpired(): boolean {
      const token = this.getAccessToken
      if (!token) return true
      try {
        const parts = token.split('.')
        if (parts.length !== 3) return true
        const payload = JSON.parse(atob(parts[1] as string))
        const expiry = payload.exp * 1000
        return Date.now() >= expiry
      } catch {
        return true
      }
    },
  },
})
