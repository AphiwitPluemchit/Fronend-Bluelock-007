import type{ Activity } from './activity'
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
export type StudentEnrollment = {
  id: string
  code: string
  name: string
  food?: string
  engName: string
  major: string
  status: string
  hardSkill: number
  softSkill: number
  registrationDate: string
  checkIn?: string
  checkOut?: string
}
export type EnrollmentResponse = {
  id: string;
  registrationDate: string;
  studentId: string;
  food?: string;
  activity: Partial<Activity>
}
export type EnrollmentQuery = Pagination & {
  major?: string[]
  status?: string[]
  studentYears?: string[]
}
