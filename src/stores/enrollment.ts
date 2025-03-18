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

      // กรอง id ที่ไม่ต้องการ
      const filteredData = res.data.filter((e) => e.id !== '000000000000000000000000')
      enrollments.value = filteredData
      total.value = filteredData.length // <<< ต้องเซต total ใหม่หลังกรอง!
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    }
  }

  //   const resetQuery = () => {
  //     query.value = {
  //       page: 1,
  //       limit: 10,
  //       search: '',
  //       sortBy: 'id',
  //       order: 'DESC',
  //       major: [],
  //       status: [],
  //       studentYears: [],
  //     }
  //   }

  return {
    enrollments,
    total,
    query,
    fetchEnrollmentsByActivityID,
  }
})
