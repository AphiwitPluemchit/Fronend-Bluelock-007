import { api } from 'boot/axios'

export class EnrollmentService {
  static path = 'enrollments'

  static async enrollment(obj: object) {
    try {
      console.log('Creating enrollment:', obj)
      const res = await api.post(this.path, obj)
      return res.status
    } catch (error) {
      console.error('Error creating enrollment:', error)
      throw error
    }
  }

  static async removeOne(id: string) {
    try {
      const res = await api.delete(`${this.path}/${id}`)
      return res.status
    } catch (error) {
      console.error(`Error deleting enrollment ID: ${id}`, error)
      throw error
    }
  }
}
