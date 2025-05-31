import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { ActivityPagination, PaginationResponse } from 'src/types/pagination'
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

  static async getAll(params: ActivityPagination) {
    const { skill, activityState, major, studentYear, ...rest } = params

    const skillQuery = skill.join(',')
    const activityStateQuery = activityState.join(',')
    const majorQuery = major.join(',')
    const studentYearQuery = studentYear.join(',')

    try {
      const res = await api.get<PaginationResponse<Activity>>(this.path, {
        params: {
          ...rest,
          skills: skillQuery,
          activityStates: activityStateQuery,
          majors: majorQuery,
          studentYears: studentYearQuery,
        },
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
      console.log('📤 ส่งข้อมูล activity:', obj)
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
      console.log('Updating activity:', obj)
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
      console.log('data', res.data)
      return res.data
    } catch (error) {
      showError('ไม่สามารถโหลดสรุปข้อมูลการลงทะเบียนได้')
      console.error(`Error fetching enrollment summary for activity ID: ${activityId}`, error)
      throw error
    }
  }
}
