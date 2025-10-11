import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HourChangeHistory, HourHistoryParams } from 'src/types/hourHistory'
import { HourHistoryService } from 'src/services/hourHistory'
import type { Meta } from 'src/types/pagination'

export const useHourHistoryStore = defineStore('hourHistory', () => {
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
   * ดึงข้อมูล hour history ทั้งหมด
   */
  const fetchHistories = async () => {
    loading.value = true
    try {
      const res = await HourHistoryService.getAll(params.value)
      console.log('Hour histories from API:', res)

      histories.value = res.data
      meta.value = res.meta
    } catch (error) {
      console.error('Error fetching hour histories:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * ดึงข้อมูล program history
   */
  const fetchProgramHistories = async (studentId?: string) => {
    loading.value = true
    try {
      const queryParams: Record<string, string | number> = {}

      if (params.value.page) queryParams.page = params.value.page
      if (params.value.limit) queryParams.limit = params.value.limit
      if (params.value.search) queryParams.search = params.value.search
      if (params.value.status) queryParams.status = params.value.status
      if (studentId) queryParams.studentId = studentId

      const res = await HourHistoryService.getProgramHistory(queryParams)
      histories.value = res.data
      meta.value = res.meta
    } catch (error) {
      console.error('Error fetching program histories:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * ดึงข้อมูล certificate history
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

      const res = await HourHistoryService.getCertificateHistory(queryParams)
      histories.value = res.data
      meta.value = res.meta
    } catch (error) {
      console.error('Error fetching certificate histories:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * เปลี่ยนหน้า
   */
  const changePage = async (page: number) => {
    params.value.page = page
    await fetchHistories()
  }

  /**
   * เปลี่ยนจำนวนรายการต่อหน้า
   */
  const changeLimit = async (limit: number) => {
    params.value.limit = limit
    params.value.page = 1
    await fetchHistories()
  }

  /**
   * ค้นหา
   */
  const searchHistories = async (searchText: string) => {
    params.value.search = searchText
    params.value.page = 1
    await fetchHistories()
  }

  /**
   * กรอง status (รองรับหลาย status)
   */
  const filterByStatus = async (statuses: string[]) => {
    if (statuses.length > 0) {
      params.value.status = statuses.join(',')
    } else {
      delete params.value.status
    }
    params.value.page = 1
    await fetchHistories()
  }

  /**
   * กรอง sourceType
   */
  const filterBySourceType = async (sourceType?: 'program' | 'certificate') => {
    if (sourceType) {
      params.value.sourceType = sourceType
    } else {
      delete params.value.sourceType
    }
    params.value.page = 1
    await fetchHistories()
  }

  /**
   * รีเซ็ต filters
   */
  const resetFilters = () => {
    params.value = {
      page: 1,
      limit: 10,
      search: '',
    }
  }

  return {
    // State
    histories,
    loading,
    params,
    meta,

    // Actions
    fetchHistories,
    fetchProgramHistories,
    fetchCertificateHistories,
    changePage,
    changeLimit,
    searchHistories,
    filterByStatus,
    filterBySourceType,
    resetFilters,
  }
})
