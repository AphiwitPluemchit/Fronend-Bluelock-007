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
  static async getLink(activityId: string, Type: string) {
    try {
      const res = await api.post<Checkinout>('/checkInOuts/generate-link', { activityId, Type })
      return res.data
    } catch (error) {
      showError('สร้างลิงค์ล้มเหลว')
      console.error('failed:', error)
    }
  }
  static async checkin(userId: string, uuid: string) {
    try {
      const res = await api.post(`/checkInOuts/checkin/${uuid}`, { userId })
      return res.data
    } catch (error) {
      showError('เช็คชื่อล้มเหลว')
      console.error('failed:', error)
    }
  }
  static async checkout(userId: string, evaluationId: string, uuid: string) {
    try {
      const res = await api.post(`/checkInOuts/checkout/${uuid}`, { userId, evaluationId })
      return res.data
    } catch (error) {
      showError('เช็คชื่อล้มเหลว')
      console.error('failed:', error)
    }
  }
  static async getStatus(studentId: string, activityItemId: string) {
    try {
      const res = await api.get('/checkInOuts/status', {
        params: {
          studentId,
          activityItemId,
        },
      })
      return res.data
    } catch (error) {
      showError('ดึงข้อมูลล้มเหลว')
      console.error('failed:', error)
    }
  }
}

export default CheckinoutService
