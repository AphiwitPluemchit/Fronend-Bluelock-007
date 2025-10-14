import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { CheckInOut } from 'src/types/checkinout'
import type { StudentEnrollment, EnrollmentCheckResponse } from 'src/types/enrollment'
import type { Pagination, PaginationResponse } from 'src/types/pagination'

const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

// 🔔 แสดงข้อความ success
const showSuccess = (message: string) => {
  Notify.create({
    message,
    type: 'positive',
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
      showSuccess('')
      return res.status
    } catch (error) {
      showError('')
      console.error('Error creating enrollment:', error)
      throw error
    }
  }

  static async updateOne(enrollmentId: string, data: Partial<CheckInOut>) {
    try {
      const res = await api.patch(`${this.path}/${enrollmentId}/checkinout`, data)
      showSuccess('')
      return res.data
    } catch (error) {
      showError('')
      console.error(`Error update enrollment ID: ${enrollmentId}`, error)
    }
  }

  static async removeOne(id: string) {
    try {
      const res = await api.delete(`${this.path}/${id}`)
      showSuccess('')
      return res.status
    } catch (error) {
      showError('')
      console.error(`Error deleting enrollment ID: ${id}`, error)
      throw error
    }
  }

  static async getEnrollmentsByProgramID(programItemId: string, params: Pagination) {
    const { studentStatus, major, studentYear, ...rest } = params

    const queryParams = {
      ...rest,
      ...(studentStatus && studentStatus.length > 0
        ? { studentStatus: studentStatus.join(',') }
        : {}),
      ...(major && major.length > 0 ? { major: major.join(',') } : {}),
      ...(studentYear && studentYear.length > 0 ? { studentYear: studentYear.join(',') } : {}),
    }

    try {
      console.log('Sending queryParams:', queryParams)
      const res = await api.get<PaginationResponse<StudentEnrollment>>(
        `${this.path}/programItems/${programItemId}/enrollments`,
        { params: queryParams },
      )
      console.log('Fetched enrollments:', res.data)
      return res.data
    } catch (error) {
      console.error(`Error fetching enrollments for program ID: ${programItemId}`, error)
      throw error
    }
  }
  static async getEnrollmentsByProgramIDs(programId: string, params: Pagination) {
    const { studentStatus, major, studentYear, ...rest } = params

    const queryParams = {
      ...rest,
      ...(studentStatus && studentStatus.length > 0
        ? { studentStatus: studentStatus.join(',') }
        : {}),
      ...(major && major.length > 0 ? { major: major.join(',') } : {}),
      ...(studentYear && studentYear.length > 0 ? { studentYear: studentYear.join(',') } : {}),
    }

    try {
      console.log('Sending queryParams:', queryParams)
      const res = await api.get<PaginationResponse<StudentEnrollment>>(
        `${this.path}/${programId}/enrollments`,
        { params: queryParams },
      )
      console.log('Fetched enrollments:', res.data)
      return res.data
    } catch (error) {
      console.error(`Error fetching enrollments for program ID: ${programId}`, error)
      throw error
    }
  }

  static async getEnrollmentsByStudentID(studentId: string, params: Pagination) {
    try {
      const { programState, skill, ...rest } = params
      const queryParams = {
        ...rest,
        ...(programState && programState.length > 0
          ? { programState: programState.join(',') }
          : {}),
        ...(skill && skill.length > 0 ? { skill: skill.join(',') } : {}),
      }
      console.log('Sending params:', queryParams)
      const res = await api.get(`${this.path}/student/${studentId}`, { params: queryParams })
      console.log('Fetched enrollments:', res.data)
      return res.data
    } catch (error) {
      console.error(`Error fetching enrollments for student ID: ${studentId}`, error)
      throw error
    }
  }

  static async checkEnrollmentByStudentIDAndProgramID(
    studentId: string,
    programId: string,
  ): Promise<EnrollmentCheckResponse> {
    try {
      const res = await api.get<EnrollmentCheckResponse>(
        `${this.path}/student/${studentId}/program/${programId}/check`,
      )
      console.log('Fetched enrollment check:', res.data)
      return res.data
    } catch (error) {
      console.error(`Error checking enrollment for student ID: ${studentId}`, error)
      throw error
    }
  }

  // static async getEnrollmentsHistoryByStudentID(studentId: string, params: Pagination) {
  //   try {
  //     const { programState, skill, ...rest } = params
  //     const queryParams = {
  //       ...rest,
  //       ...(programState && programState.length > 0
  //         ? { programState: programState.join(',') }
  //         : {}),
  //       ...(skill && skill.length > 0 ? { skill: skill.join(',') } : {}),
  //     }
  //     console.log('Sending params:', queryParams)
  //     const res = await api.get(`${this.path}/history/student/${studentId}`, {
  //       params: queryParams,
  //     })
  //     console.log('Fetched enrollments:', res.data)
  //     return res.data
  //   } catch (error) {
  //     console.error(`Error fetching enrollments for student ID: ${studentId}`, error)
  //     throw error
  //   }
  // }
}
