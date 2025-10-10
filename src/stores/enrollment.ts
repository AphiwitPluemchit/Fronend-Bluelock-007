import { defineStore } from 'pinia'
import { EnrollmentService } from 'src/services/enrollment'
import { ref } from 'vue'
import type { StudentEnrollment } from 'src/types/enrollment'
import type { Pagination } from 'src/types/pagination'
import type { CheckInOut } from 'src/types/checkinout'

export const useEnrollmentStore = defineStore('enrollment', () => {
  const studentEnrollments = ref<StudentEnrollment[]>([]) // ข้อมูลนิสิตที่ลงทะเบียน
  const total = ref(0)

  const query = ref<Pagination>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'id',
    order: 'DESC',
    major: [],
    studentStatus: [],
    studentYear: [],
  })

  // const fetchEnrollmentsByProgramID = async (
  //   programId: string,
  //   // query: ProgramEnrollmentPagination,
  // ) => {
  //   try {
  //     console.log('Query Params before API:', query)
  //     const res = await EnrollmentService.getEnrollmentsByProgramID(programId, query.value)
  //     studentEnrollments.value = res.data
  //     total.value = res.meta.total
  //     console.log('Fetched enrollments:', res)
  //   } catch (error) {
  //     console.error('Error fetching enrollments:', error)
  //   }
  // }
  const updateEnrollmentCheckinCheckout = async (enrollmentId: string, data: Partial<CheckInOut>) => {
    try {
      await EnrollmentService.updateOne(enrollmentId, data)
    } catch (error) {
      console.error('Error deleting enrollment:', error)
      throw error
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

  return {
    studentEnrollments,
    total,
    query,
    // fetchEnrollmentsByProgramID,
    updateEnrollmentCheckinCheckout,
    deleteEnrollmentById,
  }
})
