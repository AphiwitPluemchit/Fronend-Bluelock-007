export type Pagination = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  order?: string
  skill?: string[]
  activityState?: string[]
  major?: string[]
  studentYear?: string[]
  studentStatus?: string[]
  studentCode?: string[]
}
export type PaginationRequest = {
  descending: boolean
  page: number
  rowsNumber: number
  rowsPerPage: number
  sortBy: string
}

export type PaginationResponse<T> = {
  data: T[]
  meta: Meta
}

export type Meta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ErrorResponse {
  error: string
  status: number
  message: string
}

export interface QTableRequest {
  pagination: {
    descending: boolean
    page: number
    rowsNumber: number
    rowsPerPage: number
    sortBy: string
  }
}
