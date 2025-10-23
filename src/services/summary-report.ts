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

  /**
   * ✨ NEW: ดึงข้อมูล summary จาก enrollment โดยตรง (แทนการใช้ Summary_Check_In_Out_Reports)
   * @param programId - ID ของ program
   * @param date - วันที่ต้องการ query (YYYY-MM-DD)
   * @returns ข้อมูล summary { registered, checkin, checkinLate, checkout, notParticipating }
   */
  static async getEnrollmentSummary(programId: string, date: string) {
    try {
      if (!programId) throw new Error('programId is required')
      if (!date) throw new Error('date is required')
      const res = await api.get(`${this.path}/enrollment/${programId}?date=${date}`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถโหลดสรุปข้อมูลการลงทะเบียนได้')
      console.error(`Error fetching enrollment summary for program ID: ${programId}`, error)
      throw error
    }
  }

  /**
   * ✨ NEW (V2): ดึงข้อมูล summary จาก enrollment โดยใช้ aggregation (ประสิทธิภาพสูงกว่า)
   * @param programId - ID ของ program
   * @param date - วันที่ต้องการ query (YYYY-MM-DD)
   * @returns ข้อมูล summary { registered, checkin, checkinLate, checkout, notParticipating }
   */
  static async getEnrollmentSummaryV2(programId: string, date: string) {
    try {
      if (!programId) throw new Error('programId is required')
      if (!date) throw new Error('date is required')
      const res = await api.get(`${this.path}/enrollment-v2/${programId}?date=${date}`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถโหลดสรุปข้อมูลการลงทะเบียนได้')
      console.error(`Error fetching enrollment summary V2 for program ID: ${programId}`, error)
      throw error
    }
  }

  /**
   * 🔴 OLD (เก็บไว้ backward compatibility): ดึงข้อมูลจาก Summary_Check_In_Out_Reports
   * @deprecated ควรใช้ getEnrollmentSummary() หรือ getEnrollmentSummaryV2() แทน
   */
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
