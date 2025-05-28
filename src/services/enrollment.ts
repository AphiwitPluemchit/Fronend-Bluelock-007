import { api } from 'boot/axios'
import type { StudentEnrollment, EnrollmentQuery } from 'src/types/enrollment'
import type { Pagination, PaginationResponse } from 'src/types/pagination'

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

  static async getEnrollmentsByActivityID(activityId: string, params: Pagination) {
    console.log(params)

    const { statusStudent, major, studentYear, ...rest } = params

    const queryParams = {
      ...rest,
      ...(statusStudent && statusStudent.length > 0
        ? { statusStudent: statusStudent.join(',') }
        : {}),
      ...(major && major.length > 0 ? { major: major.join(',') } : {}),
      ...(studentYear && studentYear.length > 0 ? { studentYear: studentYear.join(',') } : {}),
    }

    try {
      console.log('Sending queryParams:', queryParams)
      const res = await api.get<PaginationResponse<StudentEnrollment>>(
        `activitys/${activityId}/enrollments`,
        { params: queryParams },
      )
      console.log('Fetched enrollments:', res.data)
      return res.data
    } catch (error) {
      console.error(`Error fetching enrollments for activity ID: ${activityId}`, error)
      throw error
    }
  }
  static async getEnrollmentsByStudentID(studentId: string, params: EnrollmentQuery) {
    try {
      console.log('Sending params:', params)
      const res = await api.get(`${this.path}/student/${studentId}`, { params })
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
