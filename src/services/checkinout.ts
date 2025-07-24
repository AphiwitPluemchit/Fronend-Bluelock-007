import { api } from 'boot/axios'
import { Notify } from 'quasar'
// import type { Checkinout } from 'src/types/checkinout'

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
  static async getLink(activityId: string, type: string) {
    try {
      const res = await api.post('/checkInOuts/admin/qr-token', { activityId, type })
      return res.data // { token, expiresAt, url, type }
    } catch (error) {
      showError('สร้างลิงค์ล้มเหลว')
      console.error('failed:', error)
    }
  }

  static async validateToken(token: string) {
    try {
      const res = await api.get(`/checkInOuts/student/validate/${token}`)
      return res.data // { activityId, token, type }
    } catch (error) {
      showError('ตรวจสอบ QR ล้มเหลว')
      console.error('failed:', error)
    }
  }

  static async getTokenInfo(token: string) {
    try {
      const res = await api.get(`/checkInOuts/student/qr/${token}`)
      return res.data // { activityId, token, type }
    } catch (error) {
      showError('ไม่พบข้อมูล QR')
      console.error('failed:', error)
    }
  }
  static async checkin(token: string) {
    try {
      const res = await api.post('/checkInOuts/student/checkin', { token })
      return res.data
    } catch (error) {
      showError('เช็คชื่อไม่สำเร็จ')
      console.error('failed:', error)
      throw error
    }
  }
  static async checkout(token: string) {
    try {
      const res = await api.post('/checkInOuts/student/checkout', { token })
      return res.data
    } catch (error) {
      showError('เช็คชื่อออกไม่สำเร็จ')
      console.error('failed:', error)
      throw error
    }
  }
  static async getStatus(studentId: string, activityId: string) {
    try {
      const res = await api.get('/checkInOuts/status', {
        params: {
          studentId,
          activityId,
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
