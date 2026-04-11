import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = (err as any).status && Number.isInteger((err as any).status)
    ? (err as any).status
    : 500;

  console.error('=== FULL ERROR DETAILS ===');
  console.error('Message:', err.message);
  console.error('Name:', err.name);
  console.error('Status:', status);
  console.error('Code:', (err as any).code);
  console.error('Detail:', (err as any).detail);
  console.error('Request:', req.method, req.originalUrl);
  console.error('Body:', JSON.stringify(req.body, null, 2));
  console.error('Stack:', err.stack);
  console.error('========================');

  res.status(status).json({
    error: err.message, // Always show for debugging
    name: err.name,
    code: (err as any).code,
    detail: (err as any).detail
  });
};