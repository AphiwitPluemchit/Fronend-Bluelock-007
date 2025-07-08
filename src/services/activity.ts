import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { Pagination, PaginationResponse } from 'src/types/pagination'
import type { EnrollmentSummary } from 'src/types/activity'
import { type Activity } from 'src/types/activity'

// ⛑️ Utility สำหรับแสดง Error
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

export class ActivityService {
  static path = 'activitys'

  static async getAll(params: Pagination) {
    const { skill, activityState, major, studentYear, ...rest } = params

    const queryParams = {
      ...rest,
      ...(Array.isArray(skill) && skill.length > 0 ? { skills: skill.join(',') } : {}),
      ...(Array.isArray(activityState) && activityState.length > 0
        ? { activityStates: activityState.join(',') }
        : {}),
      ...(Array.isArray(major) && major.length > 0 ? { majors: major.join(',') } : {}),
      ...(Array.isArray(studentYear) && studentYear.length > 0
        ? { studentYears: studentYear.join(',') }
        : {}),
    }

    try {
      const res = await api.get<PaginationResponse<Activity>>(this.path, {
        params: queryParams,
      })
      return res.data
    } catch (error) {
      showError('ไม่สามารถโหลดกิจกรรมได้')
      console.error('Error fetching activities:', error)
      throw error
    }
  }

  static async getOne(id: string) {
    try {
      const res = await api.get(`${this.path}/${id}`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถโหลดข้อมูลกิจกรรมได้')
      console.error(`Error fetching activity ID: ${id}`, error)
      throw error
    }
  }

  static async createOne(obj: Partial<Activity>) {
    try {
      const res = await api.post(this.path, obj)
      return {
        status: res.status,
        id: res.data.data.id,
      }
    } catch (error) {
      showError('ไม่สามารถสร้างกิจกรรมได้')
      console.error('Error creating activity:', error)
      throw error
    }
  }

  static async uploadImage(id: string, file: File, oldFileName?: string) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const query = oldFileName ? `?filename=${oldFileName}` : ''
      const res = await api.post(`${this.path}/${id}/image${query}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return {
        status: res.status,
        fileName: res.data.fileName,
      }
    } catch (error) {
      showError('ไม่สามารถอัปโหลดรูปกิจกรรมได้')
      console.error('Error uploading image:', error)
      throw error
    }
  }

  static async deleteImage(id: string, fileName: string) {
    try {
      const res = await api.delete(`${this.path}/${id}/image?filename=${fileName}`)
      return res.status
    } catch (error) {
      showError('ไม่สามารถลบรูปกิจกรรมได้')
      console.error('Error deleting image:', error)
      throw error
    }
  }

  static async updateOne(obj: Partial<Activity>) {
    try {
      if (!obj.id) {
        throw new Error('Missing ID for update')
      }
      const res = await api.put(`${this.path}/${obj.id}`, obj)
      return res.status
    } catch (error) {
      showError('ไม่สามารถอัปเดตกิจกรรมได้')
      console.error('Error updating activity:', error)
      throw error
    }
  }

  static async removeOne(id: string) {
    try {
      const res = await api.delete(`${this.path}/${id}`)
      return res.status
    } catch (error) {
      showError('ไม่สามารถลบกิจกรรมได้')
      console.error(`Error deleting activity ID: ${id}`, error)
      throw error
    }
  }

  static async getEnrollmentSummary(activityId: string) {
    try {
      const res = await api.get<EnrollmentSummary>(`${this.path}/${activityId}/enrollment-summary`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถโหลดสรุปข้อมูลการลงทะเบียนได้')
      console.error(`Error fetching enrollment summary for activity ID: ${activityId}`, error)
      throw error
    }
  }

  static async getAllCalendar(params: {
    year: string
    month: string
    skill?: string[]
    activityState?: string[]
    major?: string[]
    studentYear?: string[]
  }) {
    const queryParams = {
      ...(params.skill ? { skills: params.skill.join(',') } : {}),
      ...(params.activityState ? { activityStates: params.activityState.join(',') } : {}),
      ...(params.major ? { majors: params.major.join(',') } : {}),
      ...(params.studentYear ? { studentYears: params.studentYear.join(',') } : {}),
    }

    return api.get(`/activitys/calendar/${params.month}/${params.year}`, {
      params: queryParams,
    })
  }
}
