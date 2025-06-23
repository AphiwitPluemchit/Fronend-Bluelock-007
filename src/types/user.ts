import type { EnumUserRole } from 'src/data/roles'

export interface User {
  id: number
  name: string
  email: string
  code?: string
  password?: string
  role: EnumUserRole
  // adminId?: number
  // admin?: Admin
  // studentId?: number
  // student?: Student
}
