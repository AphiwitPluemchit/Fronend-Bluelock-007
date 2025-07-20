import { api } from 'src/boot/axios'
import { Notify } from 'quasar'
import type { Pagination, PaginationResponse } from 'src/types/pagination'
import type { ExcelStudentRow, Student } from 'src/types/student'
import type { AxiosError } from 'axios'

// 🔔 แสดงข้อความ error
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

// 🔔 แสดงข้อความ success
const showSuccess = (message: string) => {
  Notify.create({
    message,
    type: 'positive',
    position: 'bottom',
    timeout: 3000,
  })
}

export class StudentService {
  static path = '/students'

  static async getAll(params: Pagination) {
    try {
      const { studentStatus, major, studentYear, studentCode, ...rest } = params
      const queryParams = {
        ...rest,
        ...(studentStatus && studentStatus.length > 0
          ? { studentStatus: studentStatus.join(',') }
          : {}),
        ...(major && major.length > 0 ? { major: major.join(',') } : {}),
        ...(studentYear && studentYear.length > 0 ? { studentYear: studentYear.join(',') } : {}),
        ...(studentCode && studentCode.length > 0 ? { studentCode: studentCode.join(',') } : {}),
      }
      const res = await api.get<PaginationResponse<Student>>(this.path, { params: queryParams })
      return res.data
    } catch (error) {
      showError('ไม่สามารถโหลดรายชื่อนักศึกษาได้')
      console.error('Error fetching students:', error)
      throw error
    }
  }

  static async getOne(code: string) {
    try {
      const res = await api.get(`${this.path}/${code}`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถโหลดข้อมูลนักศึกษาได้')
      console.error(`Error fetching student ID: ${code}`, error)
      throw error
    }
  }

  static async createStudent(student: ExcelStudentRow[]) {
    try {
      const res = await api.post(this.path, student)
      return res.status
    } catch (error) {
      showError('ไม่สามารถเพิ่มข้อมูลนักศึกษาได้')
      console.error('Error creating student:', error)
      throw error
    }
  }

  static async updateOne(student: Student) {
    const payload = {
      code: student.code,
      name: student.name,
      email: student.email,
      status: student.status,
      softSkill: student.softSkill,
      hardSkill: student.hardSkill,
      major: student.major,
    }

    try {
      const res = await api.put(`${this.path}/${student.id}`, payload)
      return res.data
    } catch (error) {
      showError('ไม่สามารถอัปเดตข้อมูลนักศึกษาได้')
      console.error('Error updating student:', error)
      throw error
    }
  }

  static async removeOne(id: string) {
    try {
      const res = await api.delete(`${this.path}/${id}`)
      return res.status
    } catch (error) {
      showError('ไม่สามารถลบนักศึกษาได้')
      console.error(`Error deleting student ID: ${id}`, error)
      throw error
    }
  }

  static async getSummaryByCode(code: string) {
    try {
      const res = await api.get(`${this.path}/sammary/${code}`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถโหลดข้อมูลสรุปนักศึกษาได้')
      console.error(`Error fetching student summary by code: ${code}`, error)
      throw error
    }
  }

  // เพิ่มฟังก์ชันดึงประวัติการอบรมของนิสิตตามรหัส
  static async getTrainingHistory(code: string) {
    try {
      const res = await api.get(`${this.path}/${code}/training-history`)
      return res.data
    } catch (error) {
      showError('ไม่สามารถโหลดประวัติการอบรมได้')
      console.error(`Error fetching training history for student code: ${code}`, error)
      throw error
    }
  }

  static async getSummaryReport(params: Pagination) {
    try {
      const { major, studentYear, ...rest } = params
      const queryParams = {
        ...rest,

        ...(major && major.length > 0 ? { major: major.join(',') } : {}),
        ...(studentYear && studentYear.length > 0 ? { studentYear: studentYear.join(',') } : {}),
      }
      const res = await api.get(`${this.path}/report/sammary-all`, { params: queryParams })
      return res.data
    } catch (error) {
      showError('ไม่สามารถโหลดข้อมูลสรุปนักศึกษาได้')
      console.error(`Error fetching student summary `, error)
      throw error
    }
  }

  // อัปเดตสถานะนักเรียนหลายคนโดยใช้ ID (ประสิทธิภาพดีกว่า)
  static async updateStudentStatusByIDs(studentIds: string[]): Promise<{ message: string; updated: number; success: boolean }> {
    try {
      const res = await api.post('/students/update-status-by-ids', {
        studentIds,
      })

      if (res.data?.message) {
        showSuccess(res.data.message)
      }

      return res.data
    } catch (error) {
      console.error('Update student status error:', error)
      const axiosError = error as AxiosError<{ code: string; error: string }>

      if (axiosError.response?.data?.code) {
        const errorCode = axiosError.response.data.code
        const errorMessage = axiosError.response.data.error || 'เกิดข้อผิดพลาด'

        switch (errorCode) {
          case 'MISSING_IDS':
            showError('กรุณาเลือกนักเรียนที่ต้องการอัปเดต')
            break
          case 'INVALID_STATUS':
            showError('สถานะไม่ถูกต้อง')
            break
          case 'UPDATE_FAILED':
            showError('อัปเดตสถานะล้มเหลว')
            break
          default:
            showError(errorMessage)
        }
      } else {
        showError('อัปเดตสถานะล้มเหลว กรุณาตรวจสอบการเชื่อมต่อ')
      }

      throw error
    }
  }
}
