/**
 * Type definitions for the server
 */

import { Request } from 'express';

/**
 * Environment configuration
 */
export interface EnvConfig {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL: string;
    CORS_ORIGIN: string;
    DEFAULT_PAGE_SIZE: number;
    MAX_PAGE_SIZE: number;
}

/**
 * API Error type
 */
export interface ApiError extends Error {
    statusCode?: number;
    errors?: unknown[];
}

/**
 * User roles for RBAC
 */
export enum UserRole {
    ADMIN = 'admin',
    OWNER = 'owner',
    USER = 'user'
}

/**
 * JWT Payload
 */
export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
}

/**
 * Authenticated Request
 */
export interface AuthRequest extends Request {
    user?: JWTPayload;
}
