import { defineStore } from 'pinia'
import { StudentService } from 'src/services/student'
import type { Pagination } from 'src/types/pagination'
import type { ExcelStudentRow, Student } from 'src/types/student'
import { ref } from 'vue'

export const useStudentStore = defineStore('student', () => {
  const students = ref<Student[]>([])
  const code = ref('')

  const student = ref<Student>({
    id: '',
    code: '',
    name: '',
    email: '',
    password: '',
    status: 0,
    softSkill: 0,
    hardSkill: 0,
    major: '',
  })

  // query
  const query = ref<Pagination>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: '_id',
    order: 'desc',
    skill: [],
    major: [],
    studentYear: [],
  })

  const createStudent = async (student: ExcelStudentRow[]) => {
    console.log('store', student)

    await StudentService.createStudent(student)
  }
  const getStudents = async () => {
    const data = await StudentService.getAll(query.value)
    students.value = data.data
    console.log(data.data)
  }

  const getStudentByCode = async (code: string) => {
    const data = await StudentService.getOne(code)
    console.log('API Response:', data) // Debugging API response
    student.value.id = data.id
    student.value.code = data.code
    student.value.name = data.name
    student.value.email = data.email
    student.value.password = data.password
    student.value.status = data.status
    student.value.softSkill = data.softSkill
    student.value.hardSkill = data.hardSkill
    student.value.major = data.major
  }

  const updateStudent = async () => {
    try {
      // แปลงค่าที่เป็นตัวเลขจาก String → Number ก่อนส่ง
      const payload = {
        ...student.value,
        softSkill: Number(student.value.softSkill),
        hardSkill: Number(student.value.hardSkill),
        status: Number(student.value.status),
      }
      console.log('Update Payload:', payload) // debug
      const res = await StudentService.updateOne(payload)
      console.log('Update success:', res)
      return true
    } catch (error) {
      console.error('Update failed:', error)
      return false
    }
  }

  return {
    createStudent,
    getStudentByCode,
    getStudents,
    student,
    query,
    students,
    code,
    updateStudent,
  }
})
