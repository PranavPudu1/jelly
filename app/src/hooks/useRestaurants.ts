import { useQuery, useInfiniteQuery, UseQueryResult, UseInfiniteQueryResult } from '@tanstack/react-query';
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
    nearby: (lat: number, long: number, radius: number) =>
        [...restaurantKeys.all, 'nearby', lat, long, radius] as const,
};

/**
 * Restaurant filter parameters
 */
export interface RestaurantFilters {
    minRating?: number;
    price?: string;
    search?: string;
}

/**
 * Hook to fetch paginated restaurants
 */
export function useRestaurants(
    filters: RestaurantFilters = {},
    page: number = 1,
    limit: number = 10
) {
    return useQuery({
        queryKey: restaurantKeys.list({ ...filters, page, limit } as any),
        queryFn: async () => {
            return await restaurantApi.fetchRestaurants({
                ...filters,
                page,
                limit,
            });
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    });
}

/**
 * Hook to fetch restaurants with infinite scroll
 * This is perfect for the swipe interface - it automatically loads more as needed
 */
export function useInfiniteRestaurants(
    filters: RestaurantFilters = {},
    limit: number = 10
): UseInfiniteQueryResult<{
    restaurants: Restaurant[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}, Error> {
    return useInfiniteQuery({
        queryKey: restaurantKeys.list({ ...filters, limit } as any),
        queryFn: async ({ pageParam = 1 }) => {
            return await restaurantApi.fetchRestaurants({
                ...filters,
                page: pageParam,
                limit,
            });
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.hasMore) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook to fetch a single restaurant by ID
 */
export function useRestaurant(id: string): UseQueryResult<Restaurant, Error> {
    return useQuery({
        queryKey: restaurantKeys.detail(id),
        queryFn: async () => await restaurantApi.fetchRestaurantById(id),
        enabled: !!id, // Only run query if ID is provided
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}

/**
 * Hook to fetch nearby restaurants
 */
export function useNearbyRestaurants(
    lat: number,
    long: number,
    radius: number = 5000,
    enabled: boolean = true
): UseQueryResult<Restaurant[], Error> {
    return useQuery({
        queryKey: restaurantKeys.nearby(lat, long, radius),
        queryFn: async () => await restaurantApi.fetchNearbyRestaurants(lat, long, radius),
        enabled: enabled && !!lat && !!long,
        staleTime: 2 * 60 * 1000, // 2 minutes (location data changes more frequently)
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Helper hook to get all restaurants from infinite query as a flat array
 */
export function useRestaurantsFlat(filters: RestaurantFilters = {}, limit: number = 10) {
    const query = useInfiniteRestaurants(filters, limit);

    const restaurants = query.data?.pages.flatMap(page => page.restaurants) || [];
    const totalFetched = restaurants.length;
    const total = query.data?.pages[0]?.pagination?.total || 0;
    const hasMore = query.data?.pages[query.data.pages.length - 1]?.pagination?.hasMore || false;

    return {
        ...query,
        restaurants,
        totalFetched,
        total,
        hasMore,
    };
}
