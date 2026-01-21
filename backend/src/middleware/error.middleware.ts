import { Request, Response, NextFunction } from 'express';
import { apiResponse } from '../utils/response';

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 400, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    apiResponse.error(res, err.message, err.statusCode, err.code);
    return;
  }

  apiResponse.error(res, 'Internal server error', 500, 'INTERNAL_ERROR');
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  apiResponse.error(res, 'Resource not found', 404, 'NOT_FOUND');
};
