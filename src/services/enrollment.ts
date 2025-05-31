import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { StudentEnrollment, EnrollmentQuery } from 'src/types/enrollment'
import type { Pagination, PaginationResponse } from 'src/types/pagination'

// 🛠️ ฟังก์ชันแสดง error
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

export class EnrollmentService {
  static path = 'enrollments'

  static async enrollment(obj: object) {
    try {
      console.log('Creating enrollment:', obj)
      const res = await api.post(this.path, obj)
      return res.status
    } catch (error) {
      showError('ไม่สามารถลงทะเบียนเข้าร่วมกิจกรรมได้')
      console.error('Error creating enrollment:', error)
      throw error
    }
  }

  static async removeOne(id: string) {
    try {
      const res = await api.delete(`${this.path}/${id}`)
      return res.status
    } catch (error) {
      showError('ไม่สามารถลบการลงทะเบียนได้')
      console.error(`Error deleting enrollment ID: ${id}`, error)
      throw error
    }
  }

  static async getEnrollmentsByActivityID(activityId: string, params: Pagination) {
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
      showError('ไม่สามารถโหลดรายชื่อนักศึกษาที่ลงทะเบียนได้')
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
      showError('ไม่สามารถโหลดข้อมูลการลงทะเบียนของนิสิตได้')
      console.error(`Error fetching enrollments for student ID: ${studentId}`, error)
      throw error
    }
  }

  static async getEnrollmentsByStudentIDAndActivityID(studentId: string, activityId: string) {
    try {
      const res = await api.get(`${this.path}/student/${studentId}/activity/${activityId}`)
      console.log('Fetched enrollments:', res.data)
      return res.data
    } catch (error) {
      showError('ไม่สามารถตรวจสอบสถานะการลงทะเบียนได้')
      console.error(`Error fetching enrollment for student ID: ${studentId}`, error)
      throw error
    }
  }
}
