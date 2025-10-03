import type{ Program } from './program'
import type{ CheckInOut } from './checkinout'
import type { Pagination } from './pagination'

export type Enrollment = {
  id: string
  registrationDate: string
  programItemId: string
  studentId: string
  student: {
    id: string
    code: string
    name: string
    major: string
    status: string
  }
}
export type StudentEnrollment = {
  id: string
  studentId: string
  code: string
  name: string
  engName: string
  major: string
  status: number
  hardSkill: number
  softSkill: number
  registrationDate: string
  enrollmentId: string
  food?: string
  checkInOut: CheckInOut[]
  checkInStatus: string
}

export type EnrollmentResponse = {
  id: string;
  registrationDate: string;
  enrollmentId: string;
  studentId: string;
  food?: string;
  program: Partial<Program>
}

export type EnrollmentCheckResponse = {
  isEnrolled: boolean;
  program?: Program;
  message: string;
  enrollmentId?: string;
}
export type EnrollmentQuery = Pagination & {
  major?: string[]
  status?: string[]
  studentYears?: string[]
}
