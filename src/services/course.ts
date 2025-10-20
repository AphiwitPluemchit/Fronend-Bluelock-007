import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { Course } from 'src/types/course'
import type { PaginationResponse } from 'src/types/pagination'

// 🔔 แสดงข้อความ error
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

export interface CourseQuery {
  page: number
  limit: number
  search?: string | undefined
  sortBy?: string
  order?: 'asc' | 'desc'
  isActive?: boolean | undefined
  isHardSkill?: boolean | undefined
  type?: string | undefined
  file?: string | undefined
}

export class CourseService {
  static path = 'courses'

  static async getAll(params?: CourseQuery): Promise<PaginationResponse<Course>> {
    try {
      const res = await api.get(this.path, { params })
      // Map backend fields -> frontend shape (imagePath -> file)
      const payload = res.data as PaginationResponse<unknown>
      if (payload && Array.isArray(payload.data)) {
        payload.data = payload.data.map((c) => {
          const obj = c as Record<string, unknown>
          return { ...obj, file: (obj['imagePath'] as string) ?? (obj['file'] as string) }
        })
      }
      return payload as PaginationResponse<Course>
    } catch (error) {
      showError('ไม่สามารถดึงรายการหัวข้ออบรมได้')
      console.error('Error getting all Course', error)
      throw error
    }
  }

  static async getOne(id: string): Promise<Course> {
    try {
      const res = await api.get(`${this.path}/${id}`)
      const c = res.data
      // normalize image field
      if (c) c.file = c.imagePath ?? c.file
      return c
    } catch (error) {
      showError('ไม่สามารถดึงรายการหัวข้ออบรมได้')
      console.error('Error getting one Course', error)
      throw error
    }
  }

  static async createCourse(payload: Course) {
    try {
      const res = await api.post(this.path, payload)
      const c = res.data
      if (c) c.file = c.imagePath ?? c.file
      return c
    } catch (error) {
      showError('ไม่สามารถเพิ่มหัวข้ออบรมได้')
      console.error('Error creating Course', error)
      throw error
    }
  }

  static async updateOne(id: string, payload: Course) {
    try {
      const res = await api.put(`${this.path}/${id}`, payload)
      return res.data
    } catch (error) {
      showError('ไม่สามารถแก้ไขหัวข้ออบรมได้')
      console.error('Error updating Course', error)
      throw error
    }
  }

  static async deleteOne(id: string) {
    try {
      const res = await api.delete(`${this.path}/${id}`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถลบหัวข้ออบรมได้')
      console.error('Error deleting Course', error)
      throw error
    }
  }

  // Upload image for a course (multipart/form-data)
  static async uploadImage(id: string, file: File, oldFileName?: string) {
    try {
      const form = new FormData()
      form.append('file', file)
      const params: Record<string, string> = {}
      if (oldFileName) params.filename = oldFileName

      const res = await api.post(`${this.path}/${id}/image`, form, {
        params,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    } catch (error) {
      showError('ไม่สามารถอัปโหลดรูปได้')
      console.error('Error uploading course image', error)
      throw error
    }
  }

  static async deleteImage(id: string, fileName: string) {
    try {
      const res = await api.delete(`${this.path}/${id}/image`, { params: { filename: fileName } })
      return res.data
    } catch (error) {
      showError('ไม่สามารถลบรูปได้')
      console.error('Error deleting course image', error)
      throw error
    }
  }

  static async getByType(type: string): Promise<Course[]> {
    try {
      const res = await api.get(`${this.path}/type/${type}`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถดึงรายการหัวข้ออบรมได้')
      console.error('Error getting Course by type', error)
      throw error
    }
  }
}
