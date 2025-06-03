export interface Student {
  id?: string
  code: string
  name: string
  email: string
  password: string
  status: number
  softSkill: number
  hardSkill: number
  major: string
}
export interface ExcelStudentRow {
  name: string
  engName: string
  code: string | number
  major: string
  password?: string | number
  softSkill?: number
  hardSkill?: number
}
