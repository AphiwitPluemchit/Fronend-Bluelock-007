import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { Pagination, PaginationResponse } from 'src/types/pagination'
import type { Student } from 'src/types/student'
import type { Course } from 'src/types/course'

// 🔔 แสดงข้อความ error
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

export interface UploadCertificate {
  id?: string
  studentId: string
  student?: Student
  courseId: string
  course?: Course
  url: string
  nameMatch: number
  nameEngMatch?: number
  courseMatch: number
  courseEngMatch?: number
  status: StatusType
  isDuplicate: boolean
  remark?: string
  uploadAt: string
  changedStatusAt?: string
  useOcr?: boolean
}

export enum StatusType {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface CertificateQuery extends Pagination {
  studentId?: string
  courseId?: string
  status?: string[] | string
  year?: string[] | string
}

export class CertificateService {
  static path = 'certificates'

  /**
   * ดึงรายการ certificate uploads พร้อม pagination และ filters
   */
  static async getAll(params?: CertificateQuery): Promise<PaginationResponse<UploadCertificate>> {
    try {
      const res = await api.get(this.path, { params })
      return res.data
    } catch (error) {
      showError('ไม่สามารถดึงรายการการอัปโหลดใบรับรองได้')
      console.error('Error getting certificate uploads:', error)
      throw error
    }
  }

  /**
   * ดึง certificate upload ของนิสิตคนใดคนหนึ่ง
   */
  static async getByStudent(
    studentId: string,
    params?: Omit<CertificateQuery, 'studentId'>,
  ): Promise<PaginationResponse<UploadCertificate>> {
    try {
      const res = await api.get(this.path, {
        params: {
          ...params,
          studentId,
        },
      })
      return res.data
    } catch (error) {
      showError('ไม่สามารถดึงรายการการอัปโหลดของนิสิตได้')
      console.error('Error getting student certificate uploads:', error)
      throw error
    }
  }

  /**
   * ดึง certificate upload ของ course
   */
  static async getByCourse(
    courseId: string,
    params?: Omit<CertificateQuery, 'courseId'>,
  ): Promise<PaginationResponse<UploadCertificate>> {
    try {
      const res = await api.get(this.path, {
        params: {
          ...params,
          courseId,
        },
      })
      return res.data
    } catch (error) {
      showError('ไม่สามารถดึงรายการการอัปโหลดของคอร์สได้')
      console.error('Error getting course certificate uploads:', error)
      throw error
    }
  }

  static async getOne(id: string): Promise<UploadCertificate> {
    try {
      const res = await api.get(`${this.path}/${id}`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถดึงประวัติการอัปโหลดได้')
      console.error('Error getting one Course', error)
      throw error
    }
  }

  static async updateOne(id: string, payload: UploadCertificate) {
    try {
      const res = await api.put(`${this.path}/${id}`, payload)
      return res.data
    } catch (error) {
      showError('ไม่สามารถแก้ไขประวัติการอัปโหลดได้')
      console.error('Error updating Course', error)
      throw error
    }
  }

  static async updateStatus(
    id: string,
    payload: { status: StatusType; remark?: string },
  ): Promise<UploadCertificate> {
    try {
      const res = await api.put(`${this.path}/${id}/status`, payload)
      // ✅ ลบการแจ้งเตือนออก ให้แจ้งที่ component แทน
      return res.data.data
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'ไม่สามารถอัปเดตสถานะได้'
      showError(message)
      console.error('Error updating certificate status', error)
      throw error
    }
  }

  static async deleteOne(id: string) {
    try {
      const res = await api.delete(`${this.path}/${id}`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถลบประวัติการอัปโหลดได้')
      console.error('Error deleting Course', error)
      throw error
    }
  }
}

export function getStatus(row: StatusType) {
  switch (row) {
    case StatusType.PENDING:
      return 'รออนุมัติ'
    case StatusType.APPROVED:
      return 'อนุมัติ'
    case StatusType.REJECTED:
      return 'ไม่อนุมัติ'
    default:
      return ''
  }
}

export function getStatusClass(status: StatusType) {
  switch (status) {
    case StatusType.PENDING:
      return 'status-pending'
    case StatusType.APPROVED:
      return 'status-approved'
    case StatusType.REJECTED:
      return 'status-rejected'
    default:
      return ''
  }
}

export function translateSkillType(isHardSkill: boolean) {
  switch (isHardSkill) {
    case true:
      return 'ทักษะทางวิชาการ'
    case false:
      return 'เตรียมความพร้อม'
    default:
      return '-'
  }
}

export const dateTime = (row: string) => {
  return new Date(row).toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    // hour: '2-digit',
    // minute: '2-digit',
    // hour12: false,
  })
}
