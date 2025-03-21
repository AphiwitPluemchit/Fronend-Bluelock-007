import { api } from 'boot/axios'
import type { Enrollment, EnrollmentQuery } from 'src/types/enrollment'
import type { PaginationResponse } from 'src/types/pagination'

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

  static async getEnrollmentsByActivityID(activityId: string, params: EnrollmentQuery) {
    try {
      console.log('Sending params:', params)
      const res = await api.get<PaginationResponse<Enrollment>>(
        `activitys/${activityId}/enrollments`,
        { params },
      )
      console.log('Fetched enrollments:', res.data)
      return res.data
    } catch (error) {
      console.error(`Error fetching enrollments for activity ID: ${activityId}`, error)
      throw error
    }
  }
  static async getEnrollmentsByStudentID(studentId: string) {
    try {
      const res = await api.get(`${this.path}/student/${studentId}`)
      console.log('Fetched enrollments:', res.data)
      return res.data
    } catch (error) {
      console.error(`Error fetching enrollments for activity ID: ${studentId}`, error)
      throw error
    }
  }
  static async getEnrollmentsByStudentIDAndActivityID(studentId: string, activityId: string) {
    try {
      const res = await api.get(`${this.path}/student/${studentId}/activity/${activityId}`)
      console.log('Fetched enrollments:', res.data)
      return res.data
    } catch (error) {
      console.error(`Error fetching enrollments for activity ID: ${studentId}`, error)
      throw error
    }
  }
}
