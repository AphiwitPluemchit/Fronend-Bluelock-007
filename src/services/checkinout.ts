import { api } from 'boot/axios'
import { Notify } from 'quasar'
// import type { Checkinout } from 'src/types/checkinout'
import axios from 'axios'
type ErrorBody = { error?: string; message?: string }
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
  static async getLink(programId: string, type: string) {
    try {
      const res = await api.post('/checkInOuts/admin/qr-token', { programId, type })
      return res.data // { token, expiresAt, url, type }
    } catch (error) {
      showError('สร้างลิงค์ล้มเหลว')
      console.error('failed:', error)
    }
  }

  static async validateToken(token: string) {
    try {
      const res = await api.get(`/checkInOuts/student/validate/${token}`)
      return res.data // { programId, token, type }
    } catch (err) {
      let msg = 'ตรวจสอบ QR ล้มเหลว'
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as unknown
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data) as ErrorBody
            msg = parsed.error || parsed.message || data
          } catch {
            msg = data
          }
        } else if (data && typeof data === 'object') {
          const body = data as ErrorBody
          msg = body.error || body.message || err.message || msg
        } else {
          msg = err.message || msg
        }
      }
      throw new Error(msg)
    }
  }

  static async getTokenInfo(token: string) {
    try {
      const res = await api.get(`/checkInOuts/student/qr/${token}`)
      return res.data // { programId, token, type }
    } catch (err) {
      let msg = 'ไม่พบข้อมูล QR'
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as unknown
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data) as ErrorBody
            msg = parsed.error || parsed.message || data
          } catch {
            msg = data
          }
        } else if (data && typeof data === 'object') {
          const body = data as ErrorBody
          msg = body.error || body.message || err.message || msg
        } else {
          msg = err.message || msg
        }
      }
      throw new Error(msg)
    }
  }
  static async checkin(token: string) {
    try {
      const res = await api.post('/checkInOuts/student/checkin', { token })
      return res.data
    } catch (err) {
      let msg = 'เกิดข้อผิดพลาด'
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as unknown
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data) as ErrorBody
            msg = parsed.error || parsed.message || data
          } catch {
            msg = data
          }
        } else if (data && typeof data === 'object') {
          const body = data as ErrorBody
          msg = body.error || body.message || err.message || msg
        } else {
          msg = err.message || msg
        }
      }
      throw new Error(msg) // ✅ โยนข้อความจริงกลับไปให้ component
    }
  }
  static async checkout(token: string) {
    try {
      const res = await api.post('/checkInOuts/student/checkout', { token })
      return res.data
    } catch (err) {
      let msg = 'เกิดข้อผิดพลาด'
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as unknown
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data) as ErrorBody
            msg = parsed.error || parsed.message || data
          } catch {
            msg = data
          }
        } else if (data && typeof data === 'object') {
          const body = data as ErrorBody
          msg = body.error || body.message || err.message || msg
        } else {
          msg = err.message || msg
        }
      }
      throw new Error(msg) // ✅ โยนข้อความจริงกลับไปให้ component
    }
  }
  // static async checkout(token: string) {
  //   try {
  //     const res = await api.post('/checkInOuts/student/checkout', { token })
  //     return res.data
  //   } catch (error) {
  //     showError('เช็คชื่อออกไม่สำเร็จ')
  //     console.error('failed:', error)
  //     throw error
  //   }
  // }
  static async getStatus(studentId: string, programId: string) {
    try {
      const res = await api.get('/checkInOuts/status', {
        params: {
          studentId,
          programId,
        },
      })
      return res.data
    } catch (error) {
      showError('ดึงข้อมูลล้มเหลว')
      console.error('failed:', error)
    }
  }

  static async getProgramForm(programId: string) {
    try {
      const res = await api.get(`/checkInOuts/student/program/${programId}/form`)
      return res.data // { formId }
    } catch (error) {
      showError('ดึงข้อมูลฟอร์มล้มเหลว')
      console.error('failed:', error)
      throw error
    }
  }
}

export default CheckinoutService
