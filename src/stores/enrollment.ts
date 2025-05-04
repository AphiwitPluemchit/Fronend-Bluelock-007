import { defineStore } from 'pinia'
import { EnrollmentService } from 'src/services/enrollment'
import { ref } from 'vue'
import type { StudentEnrollment } from 'src/types/enrollment'
import type { ActivityEnrollmentPagination } from 'src/types/pagination'

export const useEnrollmentStore = defineStore('enrollment', () => {
  const studentEnrollments = ref<StudentEnrollment[]>([]) // ข้อมูลนิสิตที่ลงทะเบียน
  const total = ref(0)

  const query = ref<ActivityEnrollmentPagination>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'id',
    order: 'DESC',
    major: [],
    status: [],
    studentYears: [],
  })

  const fetchEnrollmentsByActivityID = async (
    activityId: string,
    // query: ActivityEnrollmentPagination,
  ) => {
    try {
      console.log('Query Params before API:', query)

      // const paramsToSend = {
      //   page: query.value.page,
      //   limit: query.value.limit,
      //   search: query.value.search,
      //   sortBy: query.value.sortBy,
      //   order: query.value.order,

      //   // KEY สำคัญตรงนี้:
      //   majors: query.value.major?.join(','), // backend รับเป็น comma-separated string
      //   status: query.value.status?.join(','), // comma-separated string
      //   years: query.value.studentYears?.join(','), // comma-separated string
      // }

      const res = await EnrollmentService.getEnrollmentsByActivityID(activityId, query.value)
      studentEnrollments.value = res.data
      total.value = res.meta.total
      console.log('Fetched enrollments:', res)

      // if (Array.isArray(res.data)) {
      //   const PLACEHOLDER_ID = '000000000000000000000000'
      //   const filteredData = res.data.filter((e) => e.id !== PLACEHOLDER_ID)
      //   enrollments.value = filteredData
      //   total.value = res.meta.total
      // } else {
      //   enrollments.value = []
      //   total.value = 0
      // }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    }
  }

  const deleteEnrollmentById = async (enrollmentId: string) => {
    try {
      await EnrollmentService.removeOne(enrollmentId)
    } catch (error) {
      console.error('Error deleting enrollment:', error)
      throw error
    }
  }

  // const resetQuery = () => {
  //   query.value = {
  //     page: 1,
  //     limit: 10,
  //     search: '',
  //     sortBy: 'id',
  //     order: 'DESC',
  //     major: [],
  //     status: [],
  //     studentYears: [],
  //   }
  // }

  return {
    studentEnrollments,
    total,
    query,
    fetchEnrollmentsByActivityID,
    deleteEnrollmentById,
  }
})
