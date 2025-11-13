// ============================================
// VALIDATION MIDDLEWARE
// Handles express-validator results
// ============================================

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * Middleware to check validation results from express-validator
 */
export const validate = (req: Request, res: Response, next: NextFunction): void | Response => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.type === 'field' ? (error as any).path : 'unknown',
            message: error.msg
        }));

        return ApiResponse.error(
            res,
            'VALIDATION_ERROR',
            'Validation failed',
            400,
            formattedErrors
        );
    }

    next();
};