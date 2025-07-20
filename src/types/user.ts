import type { EnumUserRole } from 'src/data/roles'

export interface User {
  id: string // เปลี่ยนจาก number เป็น string เพราะ backend ส่ง ObjectID
  name: string
  email: string
  code?: string
  password?: string
  role: EnumUserRole
  studentYear?: number
  major?: string
  lastLogin?: string // เพิ่มจาก backend
  // adminId?: number
  // admin?: Admin
  // studentId?: number
  // student?: Student
}
