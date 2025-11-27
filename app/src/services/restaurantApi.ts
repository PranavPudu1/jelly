import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import type { Restaurant } from '../types';

/**
 * API Response types
 */
interface PaginationInfo {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
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

interface FetchNearbyParams {
    lat: number;
    long: number;
    radius?: number;
    price?: string;
    minRating?: number;
    cuisine?: string;
    page?: number;
    pageSize?: number;
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
        .filter(
            ([_, value]) =>
                value !== undefined && value !== null && value !== '',
        )
        .map(
            ([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        )
        .join('&');

    return query ? `?${query}` : '';
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
 * Fetch paginated restaurants
 */
export async function fetchRestaurants(
    params: FetchRestaurantsParams = {},
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
        restaurants: response.data, // Backend already returns transformed data
        pagination: response.pagination,
    };
}

/**
 * Fetch a single restaurant by ID
 */
export async function fetchRestaurantById(id: string): Promise<Restaurant> {
    const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.restaurants.getById(id)}`;

    const response =
        await fetchWithErrorHandling<SingleRestaurantResponse>(url);

    if (!response.success || !response.data) {
        throw new Error('Restaurant not found');
    }

    return response.data; // Backend already returns transformed data
}


/**
 * Fetch paginated nearby restaurants with filters
 * This function uses the comprehensive /restaurants endpoint with proper pagination
 */
export async function fetchNearbyPaginated(
    params: FetchNearbyParams
): Promise<FetchRestaurantsResult> {
    const { lat, long, page = 1, pageSize = 10, ...filters } = params;

    // Build query parameters matching the backend API
    const queryParams = {
        lat,
        long,
        radius: params.radius || 5000,
        page,
        pageSize,
        sortBy: 'distance', // Default to sorting by distance
        ...(filters.price && { price: filters.price }),
        ...(filters.minRating && { minRating: filters.minRating }),
        ...(filters.cuisine && { types: filters.cuisine }),
    };

    const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.restaurants.getAll}${buildQueryString(queryParams)}`;

    const response = await fetchWithErrorHandling<RestaurantsResponse>(url);

    if (!response.success) {
        throw new Error('Failed to fetch restaurants');
    }

    return {
        restaurants: response.data, // Backend already returns fully transformed data
        pagination: response.pagination,
    };
}

export const restaurantApi = {
    fetchRestaurants,
    fetchRestaurantById,
    fetchNearbyPaginated,
};
