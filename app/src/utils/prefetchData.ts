import { QueryClient } from '@tanstack/react-query';
import { restaurantApi } from '../services/restaurantApi';
import { restaurantKeys } from '../hooks/useRestaurants';

/**
 * Prefetch all relevant app data in the background
 * This is called during app initialization to improve user experience
 */
export async function prefetchAppData(queryClient: QueryClient): Promise<void> {
    try {
        // Prefetch initial restaurant data (first page)
        await queryClient.prefetchInfiniteQuery({
            queryKey: restaurantKeys.list({ limit: 10 } as any),
            queryFn: async ({ pageParam = 1 }) => {
                return await restaurantApi.fetchRestaurants({
                    page: pageParam,
                    limit: 10,
                });
            },
            initialPageParam: 1,
            pages: 1, // Only prefetch first page to keep initial load fast
        });

        console.log('[Prefetch] Restaurant data loaded successfully');
    }
    catch (error) {
        // Don't block app initialization if prefetch fails
        // The data will be fetched on-demand when needed
        console.warn('[Prefetch] Failed to load restaurant data:', error);
    }
}