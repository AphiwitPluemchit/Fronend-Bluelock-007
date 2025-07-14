import { defineStore } from 'pinia'
import { StudentService } from 'src/services/student'
import type { Pagination } from 'src/types/pagination'
import type { ExcelStudentRow, Student, TrainingHistoryItem } from 'src/types/student' // เพิ่ม TrainingHistoryItem ถ้ามี
import { ref } from 'vue'

export const useStudentStore = defineStore('student', () => {
  const students = ref<Student[]>([])
  const totalStudentsCount = ref(0)
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

  // เพิ่ม state เก็บประวัติการอบรม
  const trainingHistory = ref<TrainingHistoryItem[]>([]) // ต้องสร้าง type นี้ใน types/student.ts

  // query
  const query = ref<Pagination>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'code',
    order: 'desc',
    skill: [],
    major: [],
    studentYear: [],
    studentStatus: [],
  })

  // ฟังก์ชันสร้างนิสิตใหม่ (จากไฟล์ Excel)
  const createStudent = async (student: ExcelStudentRow[]) => {
    console.log('store', student)
    await StudentService.createStudent(student)
  }

  // ฟังก์ชันดึงนิสิตทั้งหมด
  const getStudents = async () => {
    const data = await StudentService.getAll(query.value)
    students.value = data.data
    totalStudentsCount.value = data.meta.total
    console.log(data)
  }

  // ฟังก์ชันดึงนิสิตตามรหัส
  const getStudentByCode = async (code: string) => {
    const data = await StudentService.getOne(code)
    console.log('API Response:', data)
    student.value = data
  }

  // ฟังก์ชันดึงประวัติการอบรมตามรหัสนิสิต (เพิ่ม)
  const getTrainingHistory = async (code: string) => {
    try {
      const data = await StudentService.getTrainingHistory(code)
      trainingHistory.value = data
      console.log('Training History:', data)
    } catch (error) {
      console.error('Failed to load training history:', error)
      trainingHistory.value = []
    }
  }

  // ฟังก์ชันอัปเดตนิสิต (รับ argument)
  const updateStudent = async (updatedStudent: Student) => {
    try {
      const payload = {
        ...updatedStudent,
        softSkill: Number(updatedStudent.softSkill),
        hardSkill: Number(updatedStudent.hardSkill),
        status: Number(updatedStudent.status),
      }
      console.log('Update Payload:', payload)
      const res = await StudentService.updateOne(payload)
      console.log('Update success:', res)
      return true
    } catch (error) {
      console.error('Update failed:', error)
      return false
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'พ้นสภาพ'
      case 1:
        return 'ชั่วโมงน้อยมาก'
      case 2:
        return 'ชั่วโมงน้อย'
      case 3:
        return 'ชั่วโมงครบ'
      default:
        return 'ไม่ทราบสถานะ'
    }
  }

  const getStatusClass = (status: number): string => {
    switch (status) {
      case 0:
        return 'status-out'
      case 1:
        return 'status-low'
      case 2:
        return 'status-medium'
      case 3:
        return 'status-complete'
      default:
        return ''
    }
  }

  return {
    createStudent,
    getStudentByCode,
    getStudents,
    getTrainingHistory, // เพิ่ม
    getStatusText,
    getStatusClass,
    student,
    query,
    students,
    code,
    totalStudentsCount,
    trainingHistory, // เพิ่ม
    updateStudent,
  }
})
