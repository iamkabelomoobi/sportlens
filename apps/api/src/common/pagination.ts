export const pageParams = (page = 1, limit = 25) => ({
  page: Math.max(1, Math.trunc(page)),
  limit: Math.min(100, Math.max(1, Math.trunc(limit))),
})
export const pagination = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
})
