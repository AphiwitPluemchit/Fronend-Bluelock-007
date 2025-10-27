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
  programItemId?: string
  sourceType: 'program' | 'certificate'
  sourceId: string
  // Populated objects (not stored in DB, only for API response)
  program?: {
    id: string
    name: string
    skill: string
    file: string
    // เพิ่ม fields อื่นๆ ถ้าต้องการ
  }
  programItem?: {
    id: string
    name?: string
    description?: string
    rooms?: string[]
    dates?: {
      date: string
      stime: string
      etime: string
    }[]
    hour?: number
  }
  certificate?: {
    id: string
    url?: string
    uploadAt?: string
  }
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
