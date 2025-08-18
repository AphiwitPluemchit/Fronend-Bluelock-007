import type { CheckinoutRecord } from './checkinout'
import type { Food, FoodVote } from './food'

export type Activity = {
  id?: string
  name: string
  type?: string
  activityState?: string
  endDateEnroll?: string
  skill?: string
  file?: string
  activityItems?: ActivityItem[] | null
  Foods?: Food[]
  foodVotes?: FoodVote[]
  EnrollmentSummary?: EnrollmentSummary
}

export type ActivityItem = {
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
  activityItemSums: ActivityItemSum[]
}

export type ActivityItemSum = {
  activityItemName: string
  registeredByMajor: {
    count: number
    majorName: string
  }[]
}
export type ActivityHistory = {
  id?: string
  name: string
  type?: string
  activityState?: string
  skill?: string
  activityItems?: ActivityItem[] | null
  hour: number
  CheckinoutRecord?: CheckinoutRecord[]
}
