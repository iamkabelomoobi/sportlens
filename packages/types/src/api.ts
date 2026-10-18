export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
export interface ApiErrorBody {
  statusCode: number
  code: string
  message: string
}
export interface ApiResponse<T> {
  data: T
  pagination?: Pagination
}
