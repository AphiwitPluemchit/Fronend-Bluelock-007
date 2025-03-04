import { api } from 'boot/axios'
import type { Activity } from 'src/types/activity'

export class ActivityService {
  static path = '/activitys'

  static async getAll() {
    try {
      const res = await api.get(this.path)
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
      console.log('Creating activity:', obj)
      const res = await api.post(this.path, obj)
      return res.status
    } catch (error) {
      console.error('Error creating activity:', error)
      throw error
    }
  }

  static async updateOne(obj: Partial<Activity>) {
    try {
      if (!obj.id) {
        throw new Error('Missing ID for update')
      }
      console.log('Updating activity:', obj)
      const res = await api.patch(`${this.path}/${obj.id}`, obj)
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
}
