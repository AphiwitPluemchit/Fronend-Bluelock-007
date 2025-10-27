import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { HourHistoryPaginatedResponse, HourHistoryParams } from 'src/types/hourHistory'

// 🔔 แสดงข้อความ error
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

export class HourHistoryService {
  static path = 'hour-history'

  /**
   * ดึง hour history ของ program พร้อม ProgramItem details
   * @param params - pagination และ filter parameters (sourceType = 'program')
   */
  static async getProgramHistoryWithDetails(
    params?: Omit<HourHistoryParams, 'sourceType'>,
  ): Promise<HourHistoryPaginatedResponse> {
    try {
      const res = await api.get(`${this.path}/details`, {
        params: {
          ...params,
          sourceType: 'program',
        },
      })
      return res.data
    } catch (error) {
      showError('ไม่สามารถดึงประวัติโครงการได้')
      console.error('Error getting program history with details:', error)
      throw error
    }
  }

  /**
   * ดึง hour history ของ certificate พร้อม Certificate details
   * @param params - pagination และ filter parameters (sourceType = 'certificate')
   */
  static async getCertificateHistoryWithDetails(
    params?: Omit<HourHistoryParams, 'sourceType'>,
  ): Promise<HourHistoryPaginatedResponse> {
    try {
      const res = await api.get(`${this.path}/details`, {
        params: {
          ...params,
          sourceType: 'certificate',
        },
      })
      return res.data
    } catch (error) {
      showError('ไม่สามารถดึงประวัติใบรับรองได้')
      console.error('Error getting certificate history with details:', error)
      throw error
    }
  }
}
