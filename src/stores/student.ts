import { defineStore } from 'pinia'
import { StudentService } from 'src/services/student'
import type { Pagination } from 'src/types/pagination'
import type { Student } from 'src/types/student'
import { onMounted, ref } from 'vue'

export const useStudentStore = defineStore('student', () => {
  const students = ref<Student[]>([])
  const code = ref('')

  const student = ref<Student>({
    id: '',
    code: '',
    name: '',
    email: '',
    password: '',
    status: '',
    softSkill: 0,
    hardSkill: 0,
    majorNames: '',
  })

  // query
  const query = ref<Pagination>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'id',
    order: 'DESC',
  })

  const getStudents = async () => {
    const data = await StudentService.getAll(query.value)
    students.value = data.data
    console.log(data.data)

    students.value = data.data.map((student) => ({
      ...student,
      majorNames: Array.isArray(student.majorNames)
        ? student.majorNames.join(', ')
        : student.majorNames || 'ไม่ระบุ',
    }))
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
    student.value.majorNames = Array.isArray(data.majorNames)
      ? data.majorNames.join(', ')
      : data.majorNames || 'ไม่ระบุ'
  }

  onMounted(async () => {
    await getStudents()
    if (code.value) {
      await getStudentByCode(code.value)
    }
  })

  return {
    getStudentByCode,
    getStudents,
    student,
    query,
    students,
    code,
  }
})
