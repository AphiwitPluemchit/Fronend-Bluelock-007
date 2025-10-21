import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { AxiosError } from 'axios'
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
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosErr = error as AxiosError<{ message?: string }>
    return axiosErr.response?.data?.message ?? defaultMessage
  }
  return defaultMessage
}
export class EnrollmentService {
  static path = 'enrollments'

  static async enrollment(obj: object): Promise<number> {
    try {
      const res = await api.post(this.path, obj)
      showSuccess('ลงทะเบียนสำเร็จ')
      return res.status
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'ลงทะเบียนไม่สำเร็จ')
      showError(message)
      console.error('Error creating enrollment:', error)
      throw error
    }
  }

  static async enrollmentByAdmin(obj: object): Promise<number> {
    try {
      const res = await api.post(`${this.path}/by-admin`, obj)
      showSuccess('ลงทะเบียนสำเร็จ')
      return res.status
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'ลงทะเบียนไม่สำเร็จ')
      showError(message)
      console.error('Error creating enrollment:', error)
      throw error
    }
  }
  // 🔹 อัปเดต CheckInOut
  static async updateOne(enrollmentId: string, data: Partial<CheckInOut>): Promise<unknown> {
    try {
      const res = await api.patch(`${this.path}/${enrollmentId}/checkinout`, data)
      showSuccess('อัปเดตสถานะการเช็คชื่อสำเร็จ')
      return res.data
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'อัปเดตสถานะไม่สำเร็จ')
      showError(message)
      console.error(`Error update enrollment ID: ${enrollmentId}`, error)
      throw error
    }
  }

// 🔹 ยกเลิกการลงทะเบียน
static async removeOne(id: string): Promise<number> {
  try {
    const res = await api.delete(`${this.path}/${id}`)
    showSuccess('ยกเลิกลงทะเบียนสำเร็จ')
    return res.status
  } catch (error: unknown) {
    const message = getErrorMessage(error, 'ยกเลิกลงทะเบียนไม่สำเร็จ')
    showError(message)
    console.error(`Error deleting enrollment ID: ${id}`, error)
    throw error
  }
}

  // 🔹 ดึงรายชื่อนักศึกษาตาม ProgramItem
  static async getEnrollmentsByProgramID(
    programItemId: string,
    params: Pagination,
  ): Promise<PaginationResponse<StudentEnrollment>> {
    const { studentStatus, major, studentYear, ...rest } = params
    const queryParams = {
      ...rest,
      ...(studentStatus?.length ? { studentStatus: studentStatus.join(',') } : {}),
      ...(major?.length ? { major: major.join(',') } : {}),
      ...(studentYear?.length ? { studentYear: studentYear.join(',') } : {}),
    }

    try {
      const res = await api.get<PaginationResponse<StudentEnrollment>>(
        `${this.path}/programItems/${programItemId}/enrollments`,
        { params: queryParams },
      )
      return res.data
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'ไม่สามารถดึงข้อมูลการลงทะเบียนได้')
      showError(message)
      console.error(`Error fetching enrollments for programItem ID: ${programItemId}`, error)
      throw error
    }
  }

  // 🔹 ดึงรายชื่อนักศึกษาตาม Program
  static async getEnrollmentsByProgramIDs(
    programId: string,
    params: Pagination,
  ): Promise<PaginationResponse<StudentEnrollment>> {
    const { studentStatus, major, studentYear, ...rest } = params
    const queryParams = {
      ...rest,
      ...(studentStatus?.length ? { studentStatus: studentStatus.join(',') } : {}),
      ...(major?.length ? { major: major.join(',') } : {}),
      ...(studentYear?.length ? { studentYear: studentYear.join(',') } : {}),
    }

    try {
      const res = await api.get<PaginationResponse<StudentEnrollment>>(
        `${this.path}/${programId}/enrollments`,
        { params: queryParams },
      )
      return res.data
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'ไม่สามารถดึงข้อมูลการลงทะเบียนได้')
      showError(message)
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
