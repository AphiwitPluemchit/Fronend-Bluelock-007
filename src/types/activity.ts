import type { Food } from './food'

export type Activity = {
  id?: string
  name: string
  type?: string
  activityState?: string
  skill?: string
  file?: string
  activityItems?: ActivityItem[] | null
  Foods?: Food[]
}

export type ActivityItem = {
  id?: string
  name?: string | null
  description?: string | null
  maxParticipants?: number | null
  room?: string[]
  hour?: number | null
  date?: {
    date: string
    stime: string
    etime: string
  }[] | null
  operator?: string
  studentYears?: number[]
  majors?: string[]
}

export type EnrollmentSummary = {
  maxParticipants: number;
  totalRegistered: number;
  remainingSlots: number;
  activityItemSums: ActivityItemSum[];
};

export type ActivityItemSum = {
  activityItemName: string;
  registeredByMajor: {
      count: number;
      majorName: string;
  }[];
};
