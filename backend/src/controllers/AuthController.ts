// ============================================
// AUTH CONTROLLER
// Handles HTTP requests for authentication
// Thin controller - delegates to AuthService
// ============================================

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/Auth';
import { ApiResponse } from '../utils/ApiResponse';
import { LoginDTO, RegisterDTO, AuthRequest } from '../types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /api/auth/login
   * Login user and return JWT token
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const loginData: LoginDTO = req.body;

      const result = await this.authService.login(loginData);

      // Optional: Set token in HttpOnly cookie for extra security
      // This prevents XSS attacks from stealing the token
      if (process.env.USE_HTTPONLY_COOKIES === 'true') {
        res.cookie('auth_token', result.token, {
          httpOnly: true,  // Prevents JavaScript access
          secure: process.env.NODE_ENV === 'production', // HTTPS only in production
          sameSite: 'strict', // CSRF protection
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
      }

      return ApiResponse.success(res, result, 200, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/register
   * Register new user
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const registerData: RegisterDTO = req.body;

      // Validate password
      this.authService.validatePassword(registerData.password);

      const result = await this.authService.register(registerData);

      return ApiResponse.success(res, result, 201, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/auth/me
   * Get current authenticated user info
   */
  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      // User info is already attached to req by authMiddleware
      const { user } = req as AuthRequest;

      if (!user) {
        throw new Error('User not found in request');
      }

      return ApiResponse.success(res, { user }, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/logout
   * Logout user (clear cookie if using HttpOnly cookies)
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      // Clear HttpOnly cookie if enabled
      if (process.env.USE_HTTPONLY_COOKIES === 'true') {
        res.clearCookie('auth_token');
      }

      return ApiResponse.success(res, null, 200, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };
}