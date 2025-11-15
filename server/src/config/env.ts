import * as dotenv from 'dotenv';
import type { EnvConfig } from '../types.d';

dotenv.config();

/**
 * Validate and parse environment variables
 */
function getEnvConfig(): EnvConfig {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is required');
    }

    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: parseInt(process.env.PORT || '3000', 10),
        DATABASE_URL: databaseUrl,
        CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
        DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10),
        MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE || '50', 10),
    };
}

export const config = getEnvConfig();

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
    console.log('✅ Environment configuration validated');
}
