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
  id: string
  type: string
  timestamp: string
  userId: string
  programItemId: string
}

