// ============================================
// API RESPONSE UTILITIES
// Standardized response formats for success and error cases
// ============================================

import { Response } from 'express';

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ApiSuccessResponse<T = any> {
    success: true;
    data: T;
    pagination?: PaginationMeta;
    message?: string;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        statusCode: number;
        details?: any;
    };
}

export class ApiResponse {
    /**
     * Send success response
     */
    static success<T>(
        res: Response,
        data: T,
        statusCode: number = 200,
        message?: string
    ): Response {
        const response: ApiSuccessResponse<T> = {
            success: true,
            data,
            ...(message && { message })
        };
        return res.status(statusCode).json(response);
    }

    /**
     * Send success response with pagination
     */
    static successWithPagination<T>(
        res: Response,
        data: T,
        pagination: PaginationMeta,
        statusCode: number = 200
    ): Response {
        const response: ApiSuccessResponse<T> = {
            success: true,
            data,
            pagination
        };
        return res.status(statusCode).json(response);
    }

    /**
     * Send error response
     */
    static error(
        res: Response,
        code: string,
        message: string,
        statusCode: number = 500,
        details?: any
    ): Response {
        const response: ApiErrorResponse = {
            success: false,
            error: {
                code,
                message,
                statusCode,
                ...(details && { details })
            }
        };
        return res.status(statusCode).json(response);
    }

    /**
     * Calculate pagination metadata
     */
    static calculatePagination(
        page: number,
        limit: number,
        total: number
    ): PaginationMeta {
        const totalPages = Math.ceil(total / limit);
        return {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };
    }
}