import { PaginationMeta } from '../response/apiResponse';

export interface PaginationParams {
  page: number;
  limit: number;
}

export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function buildMeta(
  page: number,
  limit: number,
  total: number,
  resultCount: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: resultCount === limit,
    hasPrev: page > 1,
  };
}
