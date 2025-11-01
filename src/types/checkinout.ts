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
  checkin: string | null
  checkout: string | null
  participation: string
}

export type ClaimTokenValidation = {
  claimToken: string
  programId: string
  type: string
  expiresAt: number
}

