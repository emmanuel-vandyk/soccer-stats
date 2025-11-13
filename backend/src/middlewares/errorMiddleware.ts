// ============================================
// ERROR MIDDLEWARE
// Centralized error handling
// ============================================

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/CustomErrors';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * Global error handler middleware
 * Must be the last middleware in the chain
 */
export const errorMiddleware = (
    error: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): Response => {
    // Log error for debugging
    console.error('Error:', error);

    // Handle operational errors (AppError instances)
    if (error instanceof AppError) {
        return ApiResponse.error(
            res,
            error.code,
            error.message,
            error.statusCode,
            error.details
        );
    }

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
        return ApiResponse.error(
            res,
            'VALIDATION_ERROR',
            'Validation error',
            400,
            (error as any).errors?.map((e: any) => ({
                field: e.path,
                message: e.message
            }))
        );
    }

    // Handle Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
        return ApiResponse.error(
            res,
            'CONFLICT',
            'Duplicate entry',
            409,
            (error as any).errors?.map((e: any) => ({
                field: e.path,
                message: e.message
            }))
        );
    }

    // Handle Sequelize foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return ApiResponse.error(
            res,
            'BAD_REQUEST',
            'Invalid reference to related entity',
            400
        );
    }

    // Handle unexpected errors
    return ApiResponse.error(
        res,
        'INTERNAL_ERROR',
        process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : error.message,
        500
    );
};

/**
 * 404 Not Found handler
 */
export const notFoundMiddleware = (req: Request, res: Response): Response => {
    return ApiResponse.error(
        res,
        'NOT_FOUND',
        `Route ${req.method} ${req.path} not found`,
        404
    );
};