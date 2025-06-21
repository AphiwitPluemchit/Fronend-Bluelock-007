import { api } from 'boot/axios'
import { Notify } from 'quasar'
import type { Pagination, PaginationResponse } from 'src/types/pagination'
import type { ExcelStudentRow, Student } from 'src/types/student'

// 🔔 แสดงข้อความ error
const showError = (message: string) => {
  Notify.create({
    message,
    type: 'negative',
    position: 'bottom',
    timeout: 3000,
  })
}

export class StudentService {
  static path = '/students'

  static async getAll(params: Pagination) {
    const { studentStatus, major, studentYear, ...rest } = params
    const queryParams = {
      ...rest,
      ...(studentStatus && studentStatus.length > 0
        ? { studentStatus: studentStatus.join(',') }
        : {}),
      ...(major && major.length > 0 ? { major: major.join(',') } : {}),
      ...(studentYear && studentYear.length > 0 ? { studentYear: studentYear.join(',') } : {}),
    }

    try {
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
}
