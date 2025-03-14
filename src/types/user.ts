import type { EnumUserRole } from 'src/data/roles'
import type { Admin } from './admin'
import type { Student } from './student'

export interface User {
  id: number
  email: string
  password?: string
  role: EnumUserRole
  adminId?: number
  admin?: Admin
  studentId?: number
  student?: Student
}
