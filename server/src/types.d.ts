/**
 * Type definitions for the server
 */

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
