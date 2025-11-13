// ============================================
// AUTH SERVICE
// Handles authentication logic (login, JWT generation)
// Follows Single Responsibility Principle
// ============================================

import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';
import { User } from '../models/user/User';
import { LoginDTO, RegisterDTO, AuthPayload } from '../types';
import { UnauthorizedError, ConflictError, ValidationError } from '../utils/CustomErrors';

export class AuthService {
    private readonly JWT_SECRET: string;
    private readonly JWT_EXPIRES_IN: string;

    constructor() {
        // Use config values from environment
        this.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES || '24h';
    }

    /**
     * Login user and generate JWT token
     */
    async login(loginData: LoginDTO): Promise<{ token: string; user: any }> {
        const { email, password } = loginData;

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Generate JWT token
        const token = this.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        // Return token and safe user data (without password)
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        };
    }

    /**
     * Register new user
     */
    async register(registerData: RegisterDTO): Promise<{ token: string; user: any }> {
        const { username, email, password } = registerData;

        // Check if user already exists
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            throw new ConflictError('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: false // Default to regular user
        });

        // Generate JWT token
        const token = this.generateToken({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role
        });

        return {
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                createdAt: newUser.createdAt
            }
        };
    }

    /**
     * Generate JWT token
     */
    private generateToken(payload: Omit<AuthPayload, 'iat' | 'exp'>): string {
        const options: SignOptions = {
            expiresIn: this.JWT_EXPIRES_IN
        };
        return jwt.sign(payload, this.JWT_SECRET as Secret, options);
    }

    /**
     * Verify JWT token
     */
    verifyToken(token: string): AuthPayload {
        try {
            return jwt.verify(token, this.JWT_SECRET) as AuthPayload;
        } catch (error) {
            throw new UnauthorizedError('Invalid or expired token');
        }
    }

    /**
     * Validate password strength
     */
    validatePassword(password: string): void {
        if (password.length < 6) {
            throw new ValidationError('Password must be at least 6 characters long');
        }
        // Add more validation rules as needed
    }
}