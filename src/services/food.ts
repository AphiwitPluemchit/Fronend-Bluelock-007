import { api } from 'boot/axios'
import type { Food } from 'src/types/food'

export class FoodService {
  static path = 'foods'

  static async getAll() {
    try {
      const res = await api.get(this.path)
      return res.data
    } catch (error) {
      console.error('Error getting all foods', error)
      throw error
    }
  }

  static async createAll(payload: Food[]) {
    try {
      const res = await api.post(this.path, payload)
      return res.data
    } catch (error) {
      console.error('Error creating foods', error)
      throw error
    }
  }
}
