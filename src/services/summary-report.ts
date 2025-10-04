import { api } from 'boot/axios'
import { Notify } from 'quasar'

// ⛑️ Utility สำหรับแสดง Error
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

export class SammaryReportService {
  static path = 'summary-report'

  static async getSamaryEnrollment(programId: string, date: string) {
    try {
      if (!programId) throw new Error('programId is required')
      if (!date) throw new Error('date is required')
      const res = await api.get(`${this.path}/${programId}/${date}`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถโหลดสรุปข้อมูลการลงทะเบียนได้')
      console.error(`Error fetching enrollment summary for program ID: ${programId}`, error)
      throw error
    }
  }
}
