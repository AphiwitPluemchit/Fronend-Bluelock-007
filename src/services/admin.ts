import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { Admin } from 'src/types/admin'
import type { Pagination, PaginationResponse } from 'src/types/pagination'

// 🔔 แสดงข้อความ error
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

export class AdminService {
  static path = 'admins'

  // static async getAll(): Promise<Admin[]> {
  //   try {
  //     const res = await api.get(this.path)
  //     return res.data || []
  //   } catch (error) {
  //     showError('ไม่สามารถดึงรายการผู้ดูแลได้')
  //     console.error('Error getting all admins', error)
  //     return []
  //   }
  // }

  static async getAll(params: Pagination) {
    try {
      const res = await api.get<PaginationResponse<Admin>>(this.path, { params: params })
      return res.data
    } catch (error) {
      showError('ไม่สามารถโหลดรายชื่อผู้ดูแลได้')
      console.error('Error fetching admins:', error)
      throw error
    }
  }
  static async createAdmin(payload: Admin) {
    try {
      const res = await api.post(this.path, payload)
      return res.data
    } catch (error) {
      showError('ไม่สามารถเพิ่มผู้ดูแลได้')
      console.error('Error creating admin', error)
      throw error
    }
  }

  static async getOne(id: string) {
    try {
      const res = await api.get(`${this.path}/${id}`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถโหลดข้อมูลผู้ดูแลได้')
      console.error(`Error fetching admin ID: ${id}`, error)
      throw error
    }
  }

  static async updateOne(id: string, payload: Admin) {
    try {
      const res = await api.put(`${this.path}/${id}`, payload)
      return res.data
    } catch (error) {
      showError('ไม่สามารถแก้ไขผู้ดูแลได้')
      console.error('Error updating admin', error)
      throw error
    }
  }

  static async deleteOne(id: string) {
    try {
      const res = await api.delete(`${this.path}/${id}`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถลบผู้ดูแลได้')
      console.error('Error deleting admin', error)
      throw error
    }
  }
}
