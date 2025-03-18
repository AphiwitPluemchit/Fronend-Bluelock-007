import { defineStore } from 'pinia'
import { EnrollmentService } from 'src/services/enrollment'
import { ref } from 'vue'
import type { PaginationResponse } from 'src/types/pagination'
import type { Enrollment, EnrollmentQuery } from 'src/types/enrollment'

export const useEnrollmentStore = defineStore('enrollment', () => {
  const enrollments = ref<Enrollment[]>([]) // ข้อมูลนิสิตที่ลงทะเบียน
  const total = ref(0) // จำนวนข้อมูลทั้งหมด สำหรับ pagination

  const query = ref<EnrollmentQuery>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'id',
    order: 'DESC',
    major: [],
    status: [],
    studentYears: [],
  })

  const fetchEnrollmentsByActivityID = async (activityId: string) => {
    try {
      const res: PaginationResponse<Enrollment> =
        await EnrollmentService.getEnrollmentsByActivityID(activityId, query.value)

      if (Array.isArray(res.data)) {
        const PLACEHOLDER_ID = '000000000000000000000000'
        const filteredData = res.data.filter((e) => e.id !== PLACEHOLDER_ID)
        enrollments.value = filteredData
        total.value = res.meta.total
      } else {
        enrollments.value = []
        total.value = 0
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    }
  }

  const resetQuery = () => {
    query.value = {
      page: 1,
      limit: 10,
      search: '',
      sortBy: 'id',
      order: 'DESC',
      major: [],
      status: [],
      studentYears: [],
    }
  }

  return {
    enrollments,
    total,
    query,
    fetchEnrollmentsByActivityID,
    resetQuery,
  }
})
