export type Pagination = {
  page: number
  limit: number
  search: string
  sortBy: string
  order: string
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

export type PaginationResponse<T> = {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
