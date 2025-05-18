import { api } from 'boot/axios'
import type { Food } from 'src/types/food'

export class FoodService {
  static path = 'foods'

  static async getAll(): Promise<Food[]> {
    try {
      const res = await api.get(this.path)
      return res.data || []
    } catch (error) {
      console.error('Error getting all foods', error)
      return []
    }
  }

  static async createFood(payload: Food) {
    try {
      console.log('✅ payload:', payload)
      const res = await api.post(this.path, payload)
      return res.data
    } catch (error) {
      console.error('Error creating food', error)
      throw error
    }
  }

  static async updateOne(id: string, payload: Food) {
    try {
      const res = await api.put(`${this.path}/${id}`, payload)
      return res.data
    } catch (error) {
      console.error('Error updating food', error)
      throw error
    }
  }

  static async deleteOne(id: string) {
    try {
      const res = await api.delete(`${this.path}/${id}`)
      return res.data
    } catch (error) {
      console.error('Error deleting food', error)
      throw error
    }
  }
}
