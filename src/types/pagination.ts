export type Pagination = {
  page: number
  limit: number
  search: string
  sortBy: string
  order: string
  skill?: string[]
  activityState?: string[]
  major?: string[]
  studentYear?: string[]
  studentStatus?: string[]
}

export type ActivityPagination = {
  page: number
  limit: number
  search: string
  sortBy: string
  order: string
  skill: string[]
  activityState: string[]
  major: string[]
  studentYear: number[]
}
export type ActivityEnrollmentPagination = {
  page: number
  limit: number
  search: string
  sortBy: string
  order: string
  major?: string[]
  studentStatus?: string[]
  studentYears?: string[]
}

export type PaginationResponse<T> = {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
