import { useState, useEffect } from 'react';
import { Restaurant } from '../types';
import { fetchRestaurants } from '../services/restaurantService';

interface UseRestaurantsOptions {
    limit?: number;
    minRating?: number;
    priceLevel?: string[];
    city?: string;
    autoFetch?: boolean;
}

interface UseRestaurantsResult {
    restaurants: Restaurant[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Hook to fetch restaurants from Supabase
 */
export function useRestaurants(options?: UseRestaurantsOptions): UseRestaurantsResult {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const autoFetch = options?.autoFetch !== false; // Default to true

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await fetchRestaurants({
                limit: options?.limit || 50,
                minRating: options?.minRating,
                priceLevel: options?.priceLevel,
                city: options?.city,
            });

            setRestaurants(data);
        }
        catch (err) {
            console.error('Error fetching restaurants:', err);
            setError(err as Error);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [
        options?.limit,
        options?.minRating,
        options?.city,
        // Stringify priceLevel array for dependency comparison
        JSON.stringify(options?.priceLevel),
    ]);

    return {
        restaurants,
        loading,
        error,
        refetch: fetchData,
    };
}
