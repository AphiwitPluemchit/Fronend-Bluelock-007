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
      console.log('Query Params before API:', query.value) // <<< ใส่ตรงนี้

      const paramsToSend = {
        page: query.value.page,
        limit: query.value.limit,
        search: query.value.search,
        sortBy: query.value.sortBy,
        order: query.value.order,

        // KEY สำคัญตรงนี้:
        majors: query.value.major?.join(','), // backend รับเป็น comma-separated string
        status: query.value.status?.join(','), // comma-separated string
        years: query.value.studentYears?.join(','), // comma-separated string
      }

      const res: PaginationResponse<Enrollment> =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await EnrollmentService.getEnrollmentsByActivityID(activityId, paramsToSend as any)

      console.log('Fetched enrollments:', res) // <<< ดู response ด้วย

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
