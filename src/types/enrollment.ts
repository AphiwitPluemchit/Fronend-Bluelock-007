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
    status: string
  }
}

export type EnrollmentQuery = Pagination & {
  major?: string[]
  status?: string[]
  studentYears?: string[]
}
