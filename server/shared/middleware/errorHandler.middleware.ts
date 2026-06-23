import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ApiResponse } from '../response/apiResponse';

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res
      .status(err.statusCode)
      .json(ApiResponse.error(err.message, err.statusCode, err.errors));
    return;
  }

  // Log full details server-side; never expose internals to the client.
  console.error('[Unhandled Error]', {
    name: err.name,
    message: err.message,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  });

  res.status(500).json(ApiResponse.error('Internal server error', 500));
}
