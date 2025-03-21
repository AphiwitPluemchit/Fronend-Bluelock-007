import { api } from 'boot/axios'
import type { ActivityPagination, PaginationResponse } from 'src/types/pagination'
import type { EnrollmentSummary } from 'src/types/activity'
import { type Activity } from 'src/types/activity'

export class ActivityService {
  static path = 'activitys'

  // ✅ รองรับ Pagination และ Status Filter
  static async getAll(params: ActivityPagination) {
    // ✅ รวม `status` เข้าไปใน Query

    const { skill, activityState, major, studentYear, ...rest } = params

    // change array to string to query
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
      console.error('Error fetching activities:', error)
      throw error
    }
  }

  static async getOne(id: string) {
    try {
      const res = await api.get(`${this.path}/${id}`)
      return res.data
    } catch (error) {
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
        id: res.data.data.id
      }
    } catch (error) {
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
  
      return res.status
    } catch (error) {
      console.error('Error uploading image:', error)
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
      console.error('Error updating activity:', error)
      throw error
    }
  }

  static async removeOne(id: string) {
    try {
      const res = await api.delete(`${this.path}/${id}`)
      return res.status
    } catch (error) {
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
      console.error(`Error fetching enrollment summary for activity ID: ${activityId}`, error)
      throw error
    }
  }
}
