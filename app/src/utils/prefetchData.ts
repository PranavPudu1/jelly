import { QueryClient } from '@tanstack/react-query';
import { restaurantApi } from '../services/restaurantApi';
import { restaurantKeys } from '../hooks/useRestaurants';

/**
 * Prefetch all relevant app data in the background
 * This is called during app initialization to improve user experience
 *
 * @param queryClient - The React Query client instance
 * @param userLocation - The user's current location (optional, will skip prefetch if not provided)
 */
export async function prefetchAppData(
    queryClient: QueryClient,
    userLocation?: { latitude: number; longitude: number } | null
): Promise<void> {
    try {
        // Skip prefetch if no location available - data will be fetched on-demand
        if (!userLocation) {
            console.log('[Prefetch] Skipping restaurant data prefetch - no location available');
            return;
        }

        // Prefetch initial restaurant data (first page) using getNearby
        await queryClient.prefetchInfiniteQuery({
            queryKey: restaurantKeys.nearby({
                lat: userLocation.latitude,
                long: userLocation.longitude,
                radius: 5000,
                filters: {},
            }),
            queryFn: async ({ pageParam = 1 }) => {
                return await restaurantApi.fetchNearbyPaginated({
                    lat: userLocation.latitude,
                    long: userLocation.longitude,
                    radius: 5000,
                    page: pageParam,
                    limit: 10,
                });
            },
            initialPageParam: 1,
            getNextPageParam: (lastPage: Awaited<ReturnType<typeof restaurantApi.fetchNearbyPaginated>>) => {
                if (lastPage.pagination.hasMore) {
                    return lastPage.pagination.page + 1;
                }
                return undefined;
            },
        });

        console.log('[Prefetch] Restaurant data loaded successfully');
    }
    catch (error) {
        // Don't block app initialization if prefetch fails
        // The data will be fetched on-demand when needed
        console.warn('[Prefetch] Failed to load restaurant data:', error);
    }
}
