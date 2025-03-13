import { defineStore } from 'pinia'
import AuthService from 'src/services/auth'
import type { Auth } from 'src/types/auth'
import { EnumUserRole } from 'src/data/roles'
import { useRouter } from 'vue-router'

export interface AuthState {
  payload: Auth | null
  form: {
    email: string
    password: string
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    payload: null,
    form: {
      email: '',
      password: '',
    },
  }),

  getters: {
    getRole: (s): EnumUserRole | undefined => s.payload?.user?.role,
    isAdmin: (s): boolean => s.payload?.user?.role === EnumUserRole.ADMIN,
    isStudent: (s): boolean => s.payload?.user?.role === EnumUserRole.STUDENT,
    getAccessToken: (s): string | undefined => s.payload?.token,
    getName: (s): string => s.payload?.user?.student?.name || s.payload?.user?.email || 'ไม่ระบุ',
  },

  actions: {
    // ✅ เข้าสู่ระบบ
    async login(): Promise<Auth | null> {
      try {
        const data = await AuthService.login(this.form.email, this.form.password)
        if (data) {
          this.payload = data
          localStorage.setItem('userPayload', JSON.stringify(data))
          return data
        }
        return null
      } catch (err) {
        console.error('Login error:', err)
        throw new Error('เข้าสู่ระบบไม่สำเร็จ')
      }
    },

    // ✅ ออกจากระบบ
    async logout(): Promise<void> {
      if (!this.payload?.user?.id) return

      try {
        await AuthService.logout(this.payload.user.id)
      } catch (err) {
        console.warn('Logout failed silently:', err)
      }

      this.payload = null
      localStorage.removeItem('userPayload')

      const router = useRouter()
      await router.push('/')
    },

    // ✅ โหลดผู้ใช้จาก localStorage
    loadUserFromLocalStorage() {
      const storedPayload = localStorage.getItem('userPayload')
      if (storedPayload) {
        this.payload = JSON.parse(storedPayload)
      }
    },

    // ✅ โหลดโปรไฟล์ล่าสุดจาก backend
    async getProfile() {
      const profile = await AuthService.fetchProfile()
      if (profile) {
        this.payload = profile
        localStorage.setItem('userPayload', JSON.stringify(profile))
      }
    },
  },
})
