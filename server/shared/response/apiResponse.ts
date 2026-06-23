export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
}

export class ApiResponse<T = null> {
  constructor(
    public readonly success: boolean,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly data: T | null = null,
    public readonly errors: unknown[] = [],
    public readonly meta?: PaginationMeta
  ) {}

  static ok<T>(message: string, data: T, meta?: PaginationMeta): ApiResponse<T> {
    return new ApiResponse(true, message, 200, data, [], meta);
  }

  static created<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(true, message, 201, data);
  }

  static error(
    message: string,
    statusCode = 400,
    errors: unknown[] = []
  ): ApiResponse<null> {
    return new ApiResponse(false, message, statusCode, null, errors);
  }
}
