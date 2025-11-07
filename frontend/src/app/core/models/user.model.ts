/**
 * User auth model
 */
export interface User {
  id: number;
  username: string;
  email: string;
  role: boolean;          // false = user, true = admin
  createdAt: string;
  updatedAt?: string;
}

/**
 * Credentials for login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Data for registering a new user
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * Response for authentication (login/register)
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Payload contained in the JWT token
 */
export interface JwtPayload {
  userId: number;
  email: string;
  role: boolean;
  iat: number;           // issued at
  exp: number;           // expires
}
