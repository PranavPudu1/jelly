import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import { transformRestaurantsArray } from './dataTransformer';
import type { Restaurant } from '../types';

/**
 * API Response types
 */
interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

interface RestaurantsResponse {
    success: boolean;
    data: any[];
    pagination: PaginationInfo;
}

interface SingleRestaurantResponse {
    success: boolean;
    data: any;
}

interface FetchRestaurantsParams {
    page?: number;
    limit?: number;
    minRating?: number;
    price?: string;
    search?: string;
}

interface FetchRestaurantsResult {
    restaurants: Restaurant[];
    pagination: PaginationInfo;
}

/**
 * Build query string from parameters
 */
function buildQueryString(params: Record<string, any>): string {
    const query = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    return query ? `?${query}` : '';
}

/**
 * Make a fetch request with error handling
 */
async function fetchWithErrorHandling<T>(
    url: string,
    options?: RequestInit
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
            throw new Error(errorData.message || `HTTP Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please check your connection');
            }
            throw error;
        }

        throw new Error('An unknown error occurred');
    }
}

/**
 * Fetch paginated restaurants
 */
export async function fetchRestaurants(
    params: FetchRestaurantsParams = {}
): Promise<FetchRestaurantsResult> {
    const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.minRating && { minRating: params.minRating }),
        ...(params.price && { price: params.price }),
        ...(params.search && { search: params.search }),
    };

    const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.restaurants.getAll}${buildQueryString(queryParams)}`;

    const response = await fetchWithErrorHandling<RestaurantsResponse>(url);

    if (!response.success) {
        throw new Error('Failed to fetch restaurants');
    }

    return {
        restaurants: transformRestaurantsArray(response.data),
        pagination: response.pagination,
    };
}

/**
 * Fetch a single restaurant by ID
 */
export async function fetchRestaurantById(id: string): Promise<Restaurant> {
    const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.restaurants.getById(id)}`;

    const response = await fetchWithErrorHandling<SingleRestaurantResponse>(url);

    if (!response.success || !response.data) {
        throw new Error('Restaurant not found');
    }

    const transformedRestaurants = transformRestaurantsArray([response.data]);
    return transformedRestaurants[0];
}

/**
 * Fetch nearby restaurants
 */
export async function fetchNearbyRestaurants(
    lat: number,
    long: number,
    radius: number = 5000
): Promise<Restaurant[]> {
    const queryParams = {
        lat,
        long,
        radius,
    };

    const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.restaurants.getNearby}${buildQueryString(queryParams)}`;

    const response = await fetchWithErrorHandling<{ success: boolean; data: any[] }>(url);

    if (!response.success) {
        throw new Error('Failed to fetch nearby restaurants');
    }

    return transformRestaurantsArray(response.data);
}

export const restaurantApi = {
    fetchRestaurants,
    fetchRestaurantById,
    fetchNearbyRestaurants,
};
