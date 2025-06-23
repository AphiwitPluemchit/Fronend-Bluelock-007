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
  },

  actions: {
    // ✅ Login: แยกเก็บ token กับ user
    async login(): Promise<Auth | null> {
      try {
        const data = await AuthService.login(this.form.email, this.form.password)
        if (data?.token && data?.user) {
          console.log(data.user)

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

    // ✅ Logout: ลบ token และ user
    async logout(): Promise<void> {
      try {
        const user = this.getUser
        if (user?.id) await AuthService.logout(user.id)
      } catch (err) {
        console.warn('Logout failed silently:', err)
      }

      localStorage.removeItem('access_token')
      localStorage.removeItem('user')

      const router = useRouter()
      await router.push('/')
    },

    // ✅ โหลดใหม่หลังรีเฟรช (ไม่มี state แต่ไว้ใช้ใน future)
    loadUserFromLocalStorage() {
      // ไม่ต้อง set state แล้ว เพราะใช้จาก localStorage ตรง ๆ
      // ฟังก์ชันนี้เอาไว้ future ถ้าคุณอยากเก็บ user ใน state ชั่วคราว
    },
  },
})
