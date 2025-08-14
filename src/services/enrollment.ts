import { api } from 'boot/axios'

import type { StudentEnrollment, EnrollmentCheckResponse } from 'src/types/enrollment'
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

  static async getEnrollmentsByActivityID(activityItemId: string, params: Pagination) {
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
        `activitys/activityItems/${activityItemId}/enrollments`,
        { params: queryParams },
      )
      console.log('Fetched enrollments:', res.data)
      return res.data
    } catch (error) {
      console.error(`Error fetching enrollments for activity ID: ${activityItemId}`, error)
      throw error
    }
  }
  static async getEnrollmentsByActivityIDs(activityId: string, params: Pagination) {
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

  static async getEnrollmentsByStudentID(studentId: string, params: Pagination) {
    try {
      const { activityState, skill, ...rest } = params
      const queryParams = {
        ...rest,
        ...(activityState && activityState.length > 0
          ? { activityState: activityState.join(',') }
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

  static async checkEnrollmentByStudentIDAndActivityID(
    studentId: string,
    activityId: string,
  ): Promise<EnrollmentCheckResponse> {
    try {
      const res = await api.get<EnrollmentCheckResponse>(
        `${this.path}/student/${studentId}/activity/${activityId}/check`,
      )
      console.log('Fetched enrollment check:', res.data)
      return res.data
    } catch (error) {
      console.error(`Error checking enrollment for student ID: ${studentId}`, error)
      throw error
    }
  }

  // static async getEnrollmentsByStudentIDAndActivityID(studentId: string, activityId: string) {
  //   try {
  //     const res = await api.get(`${this.path}/student/${studentId}/activity/${activityId}`)
  //     console.log('Fetched enrollments:', res.data)
  //     return res.data
  //   } catch (error) {
  //     console.error(`Error fetching enrollment for student ID: ${studentId}`, error)
  //     throw error
  //   }
  // }
}
