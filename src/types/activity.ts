import type { Major } from './major'

export type Activity = {
  id?: string
  name: string
  type?: string
  activityState?: string
  skill?: string
  file?: string
  studentYears?: number[]
  majors?: Major[]
  activityItems?: ActivityItem[] | null
}

export type ActivityItem = {
  id?: string
  name?: string | null
  description?: string | null
  maxParticipants?: number | null
  room?: string | null
  hour?: number | null
  date?:
    | [
        {
          date: string
          stime: string
          etime: string
        },
      ]
    | null
}
