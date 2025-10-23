import type { AxiosError } from 'axios'
import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { Admin } from 'src/types/admin'
import type { Pagination, PaginationResponse } from 'src/types/pagination'

const showSuccess = (message: string) => {
  Notify.create({
    message,
    type: 'positive',
    position: 'bottom',
    timeout: 3000,
  })
}
// 🔔 แสดงข้อความ error
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosErr = error as AxiosError<{ message?: string }>
    return axiosErr.message
  }
  return defaultMessage
}
export class AdminService {
  static path = 'admins'

  static async getAll(params: Pagination) {
    try {
      const res = await api.get<PaginationResponse<Admin>>(this.path, { params: params })
      return res.data
    } catch (error) {
      const message = getErrorMessage(error, 'ไม่สามารถโหลดรายชื่อผู้ดูแลได้')
      showError(message)
      console.error('Error fetching admins:', error)
      throw error
    }
  }
  static async createAdmin(payload: Admin) {
    try {
      const res = await api.post(this.path, payload)
      showSuccess('เพิ่มผู้ดูแลสำเร็จ')
      return res.data
    } catch (error) {
      const message = getErrorMessage(error, 'ไม่สามารถเพิ่มผู้ดูแลได้')
      showError(message)
      console.error('Error creating admin', error)
      throw error
    }
  }

  static async getOne(id: string) {
    try {
      const res = await api.get(`${this.path}/${id}`)
      return res.data
    } catch (error) {
      const message = getErrorMessage(error, 'ไม่สามารถโหลดข้อมูลผู้ดูแลได้')
      showError(message)
      console.error(`Error fetching admin ID: ${id}`, error)
      throw error
    }
  }

  static async updateOne(id: string, payload: Admin) {
    try {
      const res = await api.put(`${this.path}/${id}`, payload)
      showSuccess('แก้ไขผู้ดูแลสำเร็จ')
      return res.data
    } catch (error) {
      const message = getErrorMessage(error, 'ไม่สามารถแก้ไขผู้ดูแลได้')
      showError(message)
      console.error('Error updating admin', error)
      throw error
    }
  }

  static async deleteOne(id: string) {
    try {
      const res = await api.delete(`${this.path}/${id}`)
      showSuccess('ลบผู้ดูแลสำเร็จ')
      return res.data
    } catch (error) {
      const message = getErrorMessage(error, 'ไม่สามารถลบผู้ดูแลได้')
      showError(message)
      console.error('Error deleting admin', error)
      throw error
    }
  }
}
