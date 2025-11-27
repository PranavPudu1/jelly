import { useQuery, useInfiniteQuery, UseQueryResult } from '@tanstack/react-query';
import { restaurantApi } from '../services/restaurantApi';
import type { Restaurant } from '../types';

/**
 * Query keys for restaurant queries
 */
export const restaurantKeys = {
    all: ['restaurants'] as const,
    lists: () => [...restaurantKeys.all, 'list'] as const,
    list: (filters: RestaurantFilters) => [...restaurantKeys.lists(), filters] as const,
    details: () => [...restaurantKeys.all, 'detail'] as const,
    detail: (id: string) => [...restaurantKeys.details(), id] as const,
    nearby: (params: NearbyRestaurantParams) =>
        [...restaurantKeys.all, 'nearby', params] as const,
};

/**
 * Restaurant filter parameters for getNearby route
 */
export interface NearbyRestaurantFilters {
    price?: string;
    rating?: number;
    cuisine?: string;
}

/**
 * Parameters for nearby restaurant queries
 */
export interface NearbyRestaurantParams {
    lat: number;
    long: number;
    radius?: number;
    filters?: NearbyRestaurantFilters;
}

/**
 * Legacy restaurant filter parameters (for backward compatibility)
 * @deprecated Use NearbyRestaurantFilters instead
 */
export interface RestaurantFilters {
    minRating?: number;
    price?: string;
    search?: string;
}

/**
 * General hook to fetch paginated restaurants using /restaurants route
 * Fetches restaurants based on location and filters with server-side pagination
 */
export function useRestaurants(params: NearbyRestaurantParams & {
    page?: number;
    pageSize?: number;
}) {
    const { lat, long, radius = 5000, filters = {}, page = 1, pageSize = 10 } = params;

    return useQuery({
        queryKey: restaurantKeys.nearby({ lat, long, radius, filters }),
        queryFn: async () => {
            return await restaurantApi.fetchNearbyPaginated({
                lat,
                long,
                radius,
                page,
                pageSize,
                price: filters.price,
                minRating: filters.rating,
                cuisine: filters.cuisine,
            });
        },
        enabled: !!lat && !!long,
        staleTime: 2 * 60 * 1000, // 2 minutes (location data changes more frequently)
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook to fetch restaurants with infinite scroll using /restaurants route
 * This is perfect for the swipe interface - it automatically loads more as needed
 */
export function useInfiniteRestaurants(params: NearbyRestaurantParams & {
    limit?: number;
}) {
    const { lat, long, radius = 5000, filters = {}, limit = 10 } = params;

    return useInfiniteQuery({
        queryKey: restaurantKeys.nearby({ lat, long, radius, filters }),
        queryFn: async ({ pageParam = 1 }) => {
            return await restaurantApi.fetchNearbyPaginated({
                lat,
                long,
                radius,
                page: pageParam,
                pageSize: limit,
                price: filters.price,
                minRating: filters.rating,
                cuisine: filters.cuisine,
            });
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.hasNextPage) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        enabled: !!lat && !!long,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook to fetch a single restaurant by ID
 */
export function useRestaurantById(id: string): UseQueryResult<Restaurant, Error> {
    return useQuery({
        queryKey: restaurantKeys.detail(id),
        queryFn: async () => await restaurantApi.fetchRestaurantById(id),
        enabled: !!id, // Only run query if ID is provided
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}

/**
 * Helper hook to get all restaurants from infinite query as a flat array
 */
export function useRestaurantsFlat(params: NearbyRestaurantParams & {
    limit?: number;
}) {
    const query = useInfiniteRestaurants(params);

    const pages = query.data?.pages || [];
    const restaurants = pages.flatMap((page) => page.restaurants);
    const totalFetched = restaurants.length;
    const total = pages[0]?.pagination?.totalCount || 0;
    const hasMore = pages[pages.length - 1]?.pagination?.hasNextPage || false;

    return {
        ...query,
        restaurants,
        totalFetched,
        total,
        hasMore,
    };
}
