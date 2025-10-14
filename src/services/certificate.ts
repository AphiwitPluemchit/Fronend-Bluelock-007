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
  courseMatch: number
  status: StatusType
  isDuplicate: boolean
  remark?: string
  uploadAt: string
  changedStatusAt: string
}

export enum StatusType {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface CertificateQuery extends Pagination {
  studentId?: string
  courseId?: string
  status?: StatusType
}

export class CertificateService {
  static path = 'certificates'

  static async getAll(params?: CertificateQuery): Promise<PaginationResponse<UploadCertificate>> {
    try {
      const res = await api.get(this.path, { params })
      return res.data
    } catch (error) {
      showError('ไม่สามารถดึงรายการประวัติการอัปโหลดได้')
      console.error('Error getting all Certificate', error)
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
      Notify.create({
        message: 'อัปเดตสถานะเรียบร้อยแล้ว',
        type: 'positive',
        position: 'bottom',
        timeout: 2000,
      })
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
      return 'status-waiting'
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
