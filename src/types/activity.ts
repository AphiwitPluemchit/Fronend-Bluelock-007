export type Activity = {
  id: string
  name: string
  type?: string
  activityState?: ActivityState
  skill?: Skill
  majors?: Major[]
  activityItems?: ActivityItem[]
}

export type ActivityItem = {
  id: string
  activityId: string
  name: string
  maxParticipants: number
  room: string
  startDate: string
  endDate: string
  duration: number
  hour: number
}

export type ActivityState = {
  id: string
  name: string
}

export type Skill = {
  id: string
  name: string
}

export type Major = {
  id: string
  name: string
}
