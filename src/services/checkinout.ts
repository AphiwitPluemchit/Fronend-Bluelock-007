import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { Checkinout } from 'src/types/checkinout'

// 📌 Utility แสดงข้อความผิดพลาด
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

class CheckinoutService {
  static async getLink(ActivityItemId: string, Type: string) {
    try {
      const res = await api.post<Checkinout>('/checkInOuts/generate-link', { ActivityItemId, Type })
      return res.data
    } catch (error) {
      showError('สร้างลิงค์ล้มเหลว')
      console.error('failed:', error)
    }
  }
}

export default CheckinoutService
