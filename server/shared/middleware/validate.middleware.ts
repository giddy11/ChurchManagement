import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';
import { ApiResponse } from '../response/apiResponse';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      res.status(422).json(
        ApiResponse.error('Validation failed', 422, formatZodErrors(result.error))
      );
      return;
    }

    (req as any).validated = result.data;
    next();
  };

function formatZodErrors(error: ZodError) {
  return error.issues.map((e: ZodIssue) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
}
