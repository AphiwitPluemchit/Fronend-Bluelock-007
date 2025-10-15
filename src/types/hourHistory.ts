export interface HourChangeHistory {
  id: string
  skillType: 'soft' | 'hard'
  status: string
  hourChange: number
  remark?: string
  changeAt: string
  title: string
  studentId: string
  enrollmentId?: string
  sourceType: 'program' | 'certificate'
  sourceId: string
}

// Status constants
// For Program: upcoming, participating, attended, absent
// For Certificate: pending, approved, rejected
export const HC_STATUS = {
  // Program statuses
  UPCOMING: 'upcoming',
  PARTICIPATING: 'participating',
  ATTENDED: 'attended',
  ABSENT: 'absent',
  // Certificate statuses
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export type HCStatus = (typeof HC_STATUS)[keyof typeof HC_STATUS]

export interface HourHistoryFilters {
  studentId?: string
  sourceType?: 'program' | 'certificate'
  status?: string // comma-separated statuses
  search?: string
}

export interface HourHistoryPaginatedResponse {
  data: HourChangeHistory[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: HourHistoryFilters
}

export interface HourHistoryParams {
  page?: number
  limit?: number
  studentId?: string
  sourceType?: 'program' | 'certificate'
  status?: string
  search?: string
}
