import { api } from 'boot/axios'
import type { Pagination, PaginationResponse } from 'src/types/pagination'
import type { Student } from 'src/types/student'

export class StudentService {
  static path = '/students'

  static async getAll(params: Pagination, status?: string) {
    // ✅ รวม `status` เข้าไปใน Query
    const queryParams = { ...params, status }
    try {
      const res = await api.get<PaginationResponse<Student>>(this.path, { params: queryParams })

      return res.data
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error
    }
  }

  static async getOne(code: string) {
    try {
      const res = await api.get(`${this.path}/${code}`)
      return res.data
    } catch (error) {
      console.error(`Error fetching student ID: ${code}`, error)
      throw error
    }
  }

  static async createOne(obj: Partial<Student>) {
    try {
      console.log('Creating student:', obj)
      const res = await api.post(this.path, obj)
      return res.status
    } catch (error) {
      console.error('Error creating student:', error)
      throw error
    }
  }

  static async updateOne(obj: Partial<Student>) {
    try {
      if (!obj.id) {
        throw new Error('Missing ID for update')
      }
      console.log('Updating student:', obj)
      const res = await api.patch(`${this.path}/${obj.id}`, obj)
      return res.status
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  }

  static async removeOne(id: string) {
    try {
      const res = await api.delete(`${this.path}/${id}`)
      return res.status
    } catch (error) {
      console.error(`Error deleting student ID: ${id}`, error)
      throw error
    }
  }
}
