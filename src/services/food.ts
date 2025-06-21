import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { Food } from 'src/types/food'

// 🔔 แสดงข้อความ error
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

export class FoodService {
  static path = 'foods'

  static async getAll(): Promise<Food[]> {
    try {
      const res = await api.get(this.path)
      return res.data || []
    } catch (error) {
      showError('ไม่สามารถดึงรายการอาหารได้')
      console.error('Error getting all foods', error)
      return []
    }
  }

  static async createFood(payload: Food) {
    try {
      const res = await api.post(this.path, payload)
      return res.data
    } catch (error) {
      showError('ไม่สามารถเพิ่มเมนูอาหารได้')
      console.error('Error creating food', error)
      throw error
    }
  }

  static async updateOne(id: string, payload: Food) {
    try {
      const res = await api.put(`${this.path}/${id}`, payload)
      return res.data
    } catch (error) {
      showError('ไม่สามารถแก้ไขเมนูอาหารได้')
      console.error('Error updating food', error)
      throw error
    }
  }

  static async deleteOne(id: string) {
    try {
      const res = await api.delete(`${this.path}/${id}`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถลบเมนูอาหารได้')
      console.error('Error deleting food', error)
      throw error
    }
  }
}
