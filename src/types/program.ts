import type { CheckinoutRecord } from './checkinout'
import type { Food, FoodVote } from './food'

export type Program = {
  id?: string
  formsId?: string
  name: string
  type?: string
  programState?: string
  endDateEnroll?: string
  skill?: string
  file?: string
  programItems?: ProgramItem[] | null
  Foods?: Food[]
  foodVotes?: FoodVote[]
  EnrollmentSummary?: EnrollmentSummary
}

export type ProgramItem = {
  id?: string
  name?: string | null
  description?: string | null
  maxParticipants?: number | null
  rooms?: string[]
  hour?: number | null
  dates?:
    | {
        date: string
        stime: string
        etime: string
      }[]
    | null
  operator?: string
  studentYears?: number[]
  majors?: string[]
  enrollmentCount?: number
}

export type EnrollmentSummary = {
  maxParticipants: number
  totalRegistered: number
  remainingSlots: number
  programItemSums: ProgramItemSum[]
}

export type ProgramItemSum = {
  programItemName: string
  registeredByMajor: {
    count: number
    majorName: string
  }[]
}
export type ProgramHistory = {
  id?: string
  name: string
  programState?: string
  skill?: string
  programItems?: ProgramItemHistory[] | null
}
export type ProgramItemHistory = {
  id?: string
  name?: string | null
  description?: string | null
  maxParticipants?: number | null
  rooms?: string[]
  hour?: number | null
  dates?:
    | {
        date: string
        stime: string
        etime: string
      }[]
    | null
  operator?: string
  studentYears?: number[]
  majors?: string[]
  enrollmentCount?: number
  checkinoutRecord?: CheckinoutRecord[]
}
