import { api } from 'boot/axios'
// import type { AxiosResponse } from 'axios'
import type { Auth } from 'src/types/auth'

class AuthService {
  static async login(email: string, password: string): Promise<Auth | null> {
    try {
      const res = await api.post<Auth>('/auth/login', { email, password })
      return res.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  static async logout(userId: number): Promise<void> {
    try {
      await api.post(`/auth/logout/${userId}`)
      localStorage.removeItem('userPayload')
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  static async fetchProfile(): Promise<Auth | null> {
    try {
      const { data } = await api.get<Auth>('/auth/profile')
      return data || null
    } catch (err) {
      console.error('Fetch profile failed:', err)
      return null
    }
  }
}

export default AuthService
