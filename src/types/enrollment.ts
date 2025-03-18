import type { Pagination } from './pagination'

export type Enrollment = {
  id: string
  registrationDate: string
  activityItemId: string
  studentId: string
  student: {
    id: string
    code: string
    name: string
    major: string
    status: number
  }
}

export type EnrollmentQuery = Pagination & {
  major?: string[]
  status?: number[]
  studentYears?: string[]
}
