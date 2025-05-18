import { api } from 'boot/axios'
import type { Pagination, PaginationResponse } from 'src/types/pagination'
import type { ExcelStudentRow, Student } from 'src/types/student'

export class StudentService {
  static path = '/students'

  static async getAll(params: Pagination, status?: string) {
    // ✅ รวม `status` เข้าไปใน Query
    const queryParams = { ...params, status }
    console.log(queryParams)

    try {
      const res = await api.get<PaginationResponse<Student>>(this.path, { params: queryParams })

      return res.data
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error
    }
  }

  static async getOne(code: string) {
    try {
      const res = await api.get(`${this.path}/${code}`)
      return res.data
    } catch (error) {
      console.error(`Error fetching student ID: ${code}`, error)
      throw error
    }
  }

  static async createStudent(student: ExcelStudentRow[]) {
    try {
      console.log('Creating student:', student)
      console.log('📦 Data to send:', JSON.stringify(student, null, 2))

      const res = await api.post(this.path, student)
      console.log('res student:', res)
      return res.status
    } catch (error) {
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
    console.log('Update Payload:', payload)

    return await api.put(`/students/${student.id}`, payload)
  }

  static async removeOne(id: string) {
    try {
      const res = await api.delete(`${this.path}/${id}`)
      return res.status
    } catch (error) {
      console.error(`Error deleting student ID: ${id}`, error)
      throw error
    }
  }
}
