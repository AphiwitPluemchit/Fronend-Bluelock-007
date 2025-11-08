import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HourChangeHistory, HourHistoryParams } from 'src/types/hourHistory'
import { HourHistoryService } from 'src/services/hourHistory'
import type { Meta } from 'src/types/pagination'

export const useHourHistoryStore = defineStore('hourHistory', () => {
  // Program statuses
  const HCStatusUpcoming = 'upcoming' // กำลังมาถึง - ลงทะเบียนแล้ว รอเข้าร่วมกิจกรรม
  const HCStatusParticipating = 'participating' // กำลังเข้าร่วมกิจกรรม (เช็คอินแล้ว กำลังเข้าร่วม)
  const HCStatusAttended = 'attended' // เข้าร่วมแล้ว (อาจได้หรือไม่ได้ชั่วโมง ขึ้นอยู่กับการเข้าร่วมและทำฟอร์ม)
  const HCStatusLate = 'late' // เข้าร่วมแต่มาสาย (เช็คอินสาย)
  const HCStatusIncomplete = 'incomplete' // มาไม่ครบ (ไม่มีการเช็คชื่อเพียงครั้งเดียว ไม่ได้ชั่วโมง)
  const HCStatusAbsent = 'absent' // ไม่มาเข้าร่วม (ไม่ได้ checkin เลย → จะถูกลบชั่วโมง)

  // Certificate statuses
  const HCStatusPending = 'pending' // รออนุมัติ (certificate)
  const HCStatusApproved = 'approved' // อนุมัติแล้ว (certificate)
  const HCStatusRejected = 'rejected' // ปฏิเสธแล้ว (certificate)

  const histories = ref<HourChangeHistory[]>([])
  const loading = ref(false)

  const params = ref<HourHistoryParams>({
    page: 1,
    limit: 10,
    search: '',
  })

  const meta = ref<Meta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  /**
   * ดึงข้อมูล program history พร้อม ProgramItem details
   * @param studentId - optional student id
   * @param paramsOverride - optional local params to avoid mutating the shared store.params
   */
  const fetchProgramHistories = async (
    studentId?: string,
    paramsOverride?: Partial<HourHistoryParams>,
  ) => {
    loading.value = true
    try {
      // Merge defaults from store params with any local overrides provided by the caller
      const merged: HourHistoryParams = {
        ...(params.value || {}),
        ...(paramsOverride || {}),
      }

      const queryParams: Record<string, string | number> = {}

      if (merged.page) queryParams.page = merged.page
      if (merged.limit) queryParams.limit = 100
      if (merged.search) queryParams.search = merged.search
      if (merged.status) queryParams.status = merged.status
      if (studentId) queryParams.studentId = studentId

      const res = await HourHistoryService.getProgramHistoryWithDetails(queryParams)
      histories.value = res.data
      meta.value = res.meta
    } catch (error) {
      console.error('Error fetching program histories:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * ดึงข้อมูล certificate history พร้อม Certificate details
   */
  const fetchCertificateHistories = async (studentId?: string) => {
    loading.value = true
    try {
      const queryParams: Record<string, string | number> = {}

      if (params.value.page) queryParams.page = params.value.page
      if (params.value.limit) queryParams.limit = params.value.limit
      if (params.value.search) queryParams.search = params.value.search
      if (params.value.status) queryParams.status = params.value.status
      if (studentId) queryParams.studentId = studentId

      const res = await HourHistoryService.getCertificateHistoryWithDetails(queryParams)
      histories.value = res.data
      meta.value = res.meta
    } catch (error) {
      console.error('Error fetching certificate histories:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    histories,
    loading,
    params,
    meta,

    // Actions
    fetchProgramHistories,
    fetchCertificateHistories,

    // Constants
    HCStatusUpcoming,
    HCStatusParticipating,
    HCStatusAttended,
    HCStatusLate,
    HCStatusIncomplete,
    HCStatusAbsent,
    HCStatusPending,
    HCStatusApproved,
    HCStatusRejected,
  }
})
