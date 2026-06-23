export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly errors: unknown[] = []
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static notFound(message = 'Not found'): AppError {
    return new AppError(message, 404);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, 403);
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409);
  }

  static badRequest(message: string, errors: unknown[] = []): AppError {
    return new AppError(message, 400, errors);
  }
}
