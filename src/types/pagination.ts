export type Pagination = {
  page: number
  limit: number
  search: string
  sortBy: string
  order: string
}

export type PaginationResponse<T> = {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPage: number
  }
}
