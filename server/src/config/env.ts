/**
 * Environment Configuration
 * Validates and exports environment variables for Supabase
 */

import * as dotenv from 'dotenv';
import type { EnvConfig } from '../types';

dotenv.config();

/**
 * Validate and parse environment variables
 */
function getEnvConfig(): EnvConfig {
    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: parseInt(process.env.PORT || '3000', 10),
        SUPABASE_URL: process.env.SUPABASE_URL || '',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
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
    const requiredVars: (keyof EnvConfig)[] = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

    const missingVars = requiredVars.filter((key) => !config[key]);

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`
        );
    }

    console.log('✅ Environment configuration validated');
}
