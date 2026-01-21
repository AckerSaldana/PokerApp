import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export const apiResponse = {
  success: <T>(res: Response, data: T, message?: string, statusCode = 200) => {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  },

  error: (res: Response, message: string, statusCode = 400, code?: string, details?: unknown) => {
    const response: ApiResponse = {
      success: false,
      error: {
        message,
        code,
        details,
      },
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  },

  paginated: <T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number
  ) => {
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    };
    return res.status(200).json(response);
  },
};
