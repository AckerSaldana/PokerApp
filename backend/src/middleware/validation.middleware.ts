import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { apiResponse } from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error?.issues) {
        const errors = error.issues.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        apiResponse.error(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors);
        return;
      }
      next(error);
    }
  };
};
