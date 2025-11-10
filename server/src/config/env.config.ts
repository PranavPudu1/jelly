/**
 * Environment Configuration
 * Validates and exports environment variables for Supabase
 */

import * as dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_ANON_KEY?: string;
  CORS_ORIGIN: string;
  DEFAULT_PAGE_SIZE: number;
  MAX_PAGE_SIZE: number;
}

/**
 * Validate and parse environment variables
 */
const getEnvConfig = (): EnvConfig => {
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
};

export const config = getEnvConfig();

/**
 * Validate required environment variables
 */
export const validateEnv = (): void => {
    const requiredVars: (keyof EnvConfig)[] = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

    const missingVars = requiredVars.filter((key) => !config[key]);

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`
        );
    }

    console.log('✅ Environment configuration validated');
};
