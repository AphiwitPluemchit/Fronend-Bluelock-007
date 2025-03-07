import type { Major } from './major'

export type Activity = {
  id: string
  name: string
  type?: string
  activityState?: string
  skill?: string
  file?: string
  studentYears?: number[]
  majors?: Major[]
  activityItems?: ActivityItem[]
}

export type ActivityItem = {
  id?: string
  name: string
  description: string
  maxParticipants: number
  room: string
  hour: number
  date: [
    {
      date: string
      stime: string
      etime: string
    },
  ]
}
