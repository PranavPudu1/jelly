/**
 * API Configuration
 * Configure your backend API URL here
 */

// Default to localhost for development
// Update this to your production URL when deploying
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const API_CONFIG = {
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
};

export const API_ENDPOINTS = {
    restaurants: {
        getAll: '/api/restaurants',
        getById: (id: string) => `/api/restaurants/${id}`,
    },
    users: {
        register: '/api/users/register',
        login: '/api/users/login',
        createTemporary: '/api/users/temporary',
        profile: '/api/users/profile',
    },
};
