export type Checkinout = {
  url: string
  token: string
  expiresAt: number
  type: string
}

export type CheckinoutRecord = {
  checkin: string
  checkout?: string
}

export type CheckInOut = {
  checkin: string | null
  checkout: string | null
  participation: string
}

