import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/response';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  if (err instanceof AppError) {
    errorResponse(res, err.message, err.errors, err.statusCode);
    return;
  }

  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      const field = err.meta?.target || 'field';
      errorResponse(
        res,
        `The ${Array.isArray(field) ? field.join(', ') : field} is already taken`,
        [],
        409
      );
      return;
    }

    if (err.code === 'P2025') {
      errorResponse(res, 'Record not found', [], 404);
      return;
    }

    errorResponse(res, 'Database error', [], 500);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse(res, 'Invalid token', [], 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    errorResponse(res, 'Token expired', [], 401);
    return;
  }

  // Default error
  errorResponse(
    res,
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    [],
    500
  );
}
