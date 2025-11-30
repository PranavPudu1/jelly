import { API_CONFIG, API_ENDPOINTS } from '../config/api';

/**
 * API Response types
 */
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface TemporaryUserData {
    user: User;
}

interface AuthUserData {
    user: User;
    token: string;
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterCredentials {
    email: string;
    password: string;
    name?: string;
    phone?: string;
}

/**
 * Make a fetch request with error handling
 */
async function fetchWithErrorHandling<T>(
    url: string,
    options?: RequestInit,
): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...API_CONFIG.headers,
                ...options?.headers,
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: response.statusText,
            }));
            throw new Error(
                errorData.message || `HTTP Error: ${response.status}`,
            );
        }

        return await response.json();
    }
    catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error(
                    'Request timeout - please check your connection',
                );
            }
            throw error;
        }

        throw new Error('An unknown error occurred');
    }
}

/**
 * Create a temporary/guest user
 */
export async function createTemporaryUser(deviceId?: string): Promise<User> {
    const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.users.createTemporary}`;

    const response = await fetchWithErrorHandling<ApiResponse<TemporaryUserData>>(url, {
        method: 'POST',
        body: JSON.stringify({ deviceId }),
    });

    if (!response.success || !response.data.user) {
        throw new Error('Failed to create temporary user');
    }

    return response.data.user;
}

/**
 * Login user
 */
export async function loginUser(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.users.login}`;

    const response = await fetchWithErrorHandling<ApiResponse<AuthUserData>>(url, {
        method: 'POST',
        body: JSON.stringify(credentials),
    });

    if (!response.success || !response.data.user) {
        throw new Error('Failed to login');
    }

    return {
        user: response.data.user,
        token: response.data.token,
    };
}

/**
 * Register new user
 */
export async function registerUser(credentials: RegisterCredentials): Promise<{ user: User; token: string }> {
    const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.users.register}`;

    const response = await fetchWithErrorHandling<ApiResponse<AuthUserData>>(url, {
        method: 'POST',
        body: JSON.stringify(credentials),
    });

    if (!response.success || !response.data.user) {
        throw new Error('Failed to register user');
    }

    return {
        user: response.data.user,
        token: response.data.token,
    };
}

export const userApi = {
    createTemporaryUser,
    loginUser,
    registerUser,
};
