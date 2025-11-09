/**
 * Environment Configuration
 * Validates and exports environment variables
 */

import * as dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;
  FIREBASE_SERVICE_ACCOUNT_PATH?: string;
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
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
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
    const requiredVars: (keyof EnvConfig)[] = [];

    const missingVars = requiredVars.filter((key) => !config[key]);

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`
        );
    }

    console.log('✅ Environment configuration validated');
};
