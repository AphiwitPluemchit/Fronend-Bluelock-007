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

    user(): Partial<User> | null {
      return this.getUser
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

    getIsAuthenticated(): boolean {
      const token = this.getAccessToken
      const user = this.getUser
      if (!token || !user) return false

      // Check if token is expired
      try {
        const parts = token.split('.')
        if (parts.length !== 3) return false
        const payload = JSON.parse(atob(parts[1] as string))
        const expiry = payload.exp * 1000
        return Date.now() < expiry
      } catch {
        return false
      }
    },
  },

  actions: {
    async login(): Promise<Auth | null> {
      try {
        console.log('🔐 Starting login process...')
        console.log('📧 Email:', this.form.email)
        console.log('🔑 Password length:', this.form.password?.length || 0)

        const data = await AuthService.login(this.form.email, this.form.password)
        console.log('📡 AuthService response:', data)

        if (data?.token && data?.user) {
          console.log('✅ Login successful:', data.user)
          console.log('🎫 Token received:', data.token.substring(0, 20) + '...')

          localStorage.setItem('access_token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))

          console.log('💾 Data saved to localStorage')
          console.log('👤 Current user role:', data.user.role)

          return data
        } else {
          console.warn('⚠️ Login response incomplete:', data)
          return null
        }
      } catch (err) {
        console.error('❌ Login error in store:', err)
        throw new Error('เข้าสู่ระบบไม่สำเร็จ')
      }
    },

    // ✅ ปรับ logout: เคลียร์ session อย่างเดียว
    //    ส่วน "redirect ไป login" ให้ response interceptor เป็นคนทำ
    async logout(): Promise<void> {
      console.log('🚪 Starting logout process...')
      try {
        const user = this.getUser
        console.log('👤 Current user:', user)

        if (user?.id) {
          console.log('🔄 Calling AuthService.logout with userId:', user.id)
          // กันลูป 401 ด้วย header บอก interceptor ว่า "ข้าม redirect"
          const logoutResult = await AuthService.logout(user.id)
          console.log('✅ AuthService.logout completed with result:', logoutResult)

          if (logoutResult) {
            console.log('🎯 Backend logout successful')
          } else {
            console.warn('⚠️ Backend logout failed, but continuing with local cleanup')
          }
        } else {
          console.warn('⚠️ No user ID found, skipping API call')
        }
      } catch (err) {
        console.warn('⚠️ Logout failed silently:', err)
        // Continue with local cleanup even if API fails
      }

      console.log('🧹 Clearing localStorage...')
      this.clearLocalStorage()
      console.log('✅ Logout process completed (no redirect here)')
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

    // ✅ เพิ่ม method ใหม่เพื่อตรวจสอบสิทธิ์การเข้าถึง path
    canAccessPath(path: string): boolean {
      const role = this.getRole
      if (!role) return false

      // ตรวจสอบว่า path ตรงกับ role หรือไม่
      if (role === EnumUserRole.ADMIN && path.startsWith('/Admin/')) {
        return true
      }

      if (role === EnumUserRole.STUDENT && path.startsWith('/Student/')) {
        return true
      }

      // QR paths - เฉพาะ student ที่ authenticated
      if (path.startsWith('/qr/') && role === EnumUserRole.STUDENT) {
        return true
      }

      // public paths (ไม่ต้อง login)
      if (path === '/' || path === '/unauthorized') {
        return true
      }

      return false
    },

    // ✅ ตรวจสอบว่า user มีสิทธิ์เข้าถึง route scope หรือไม่
    canAccessScope(scope: string): boolean {
      const role = this.getRole
      if (!role) return false

      if (scope === 'public' || scope === 'checkinout') return true

      if (role === EnumUserRole.ADMIN && scope === 'admin') return true
      if (role === EnumUserRole.STUDENT && scope === 'student') return true

      return false
    },

    // ✅ ตรวจสอบความถูกต้องของข้อมูล user
    validateUserData(): boolean {
      const user = this.getUser
      const token = this.getAccessToken

      if (!user || !token) return false

      // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบหรือไม่
      if (!user.id || !user.role || !user.email) return false

      // ตรวจสอบว่า role ถูกต้องหรือไม่
      if (!Object.values(EnumUserRole).includes(user.role)) return false

      return true
    },

    // ✅ ตรวจสอบว่า user สามารถเข้าถึง route ที่กำหนดได้หรือไม่
    canAccessRoute(route: { meta?: { scope?: string } }): boolean {
      if (!route.meta?.scope) return false

      const scope = route.meta.scope
      return this.canAccessScope(scope)
    },

    // ✅ ตรวจสอบว่า user สามารถเข้าถึง nested routes ได้หรือไม่
    canAccessNestedRoute(matched: Array<{ meta?: { scope?: string } }>): boolean {
      for (const route of matched) {
        if (route.meta?.scope && !this.canAccessScope(route.meta.scope)) {
          return false
        }
      }
      return true
    },

    // ✅ ตรวจสอบความปลอดภัยของ session
    validateSession(): boolean {
      // ตรวจสอบ token
      if (this.isTokenExpired()) return false

      // ตรวจสอบข้อมูล user
      if (!this.validateUserData()) return false

      // ตรวจสอบว่า token ตรงกับ user หรือไม่ (ถ้ามีข้อมูลเพิ่มเติม)
      return true
    },

    // ✅ Login with Google OAuth token
    loginWithToken(token: string): boolean {
      try {
        console.log('🔐 Starting Google token login process...')
        console.log('🎫 Token received:', token.substring(0, 20) + '...')

        // Decode JWT to get user info
        const parts = token.split('.')
        if (parts.length !== 3) {
          throw new Error('Invalid token format')
        }

        const payload = JSON.parse(atob(parts[1] as string))
        console.log('📋 Token payload:', payload)

        // Check if token is expired
        const expiry = payload.exp * 1000
        if (Date.now() >= expiry) {
          throw new Error('Token has expired')
        }

        // Create user object from token payload
        const user: Partial<User> = {
          id: payload.userId,
          email: payload.email,
          role: payload.role as EnumUserRole, // Ensure proper type casting
          name: payload.name || payload.email,
          // Add other fields as needed
        }

        console.log('✅ Google login successful:', user)
        console.log('👤 User role:', user.role)
        console.log(
          '🔍 Role comparison - Expected Admin:',
          EnumUserRole.ADMIN,
          'Expected Student:',
          EnumUserRole.STUDENT,
        )

        // Validate role
        if (!Object.values(EnumUserRole).includes(user.role as EnumUserRole)) {
          console.error('❌ Invalid user role:', user.role)
          throw new Error(`Invalid user role: ${user.role}`)
        }

        // Store token and user data
        localStorage.setItem('access_token', token)
        localStorage.setItem('user', JSON.stringify(user))

        console.log('💾 Data saved to localStorage')
        console.log('🎯 Final user role for redirect:', user.role)

        return true
      } catch (err) {
        console.error('❌ Google token login error:', err)
        this.clearLocalStorage()
        return false
      }
    },

    // ✅ สร้าง session security report
    getSecurityReport(): {
      isValid: boolean
      issues: string[]
      recommendations: string[]
    } {
      const issues: string[] = []
      const recommendations: string[] = []

      if (!this.getAccessToken) {
        issues.push('No access token found')
        recommendations.push('Please login again')
      }

      if (this.isTokenExpired()) {
        issues.push('Token has expired')
        recommendations.push('Please login again')
      }

      if (!this.validateUserData()) {
        issues.push('Invalid user data')
        recommendations.push('Please login again')
      }

      if (!this.getRole) {
        issues.push('No user role defined')
        recommendations.push('Please contact administrator')
      }

      const isValid = issues.length === 0

      return {
        isValid,
        issues,
        recommendations,
      }
    },
  },
})
