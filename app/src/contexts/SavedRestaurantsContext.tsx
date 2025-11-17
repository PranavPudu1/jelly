import { createContext, PropsWithChildren, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Restaurant } from '../types';

const SAVED_RESTAURANTS_KEY = '@saved_restaurants';

interface SavedRestaurantsContextType {
    savedRestaurants: Restaurant[];
    saveRestaurant: (restaurant: Restaurant) => Promise<void>;
    unsaveRestaurant: (restaurantId: string) => Promise<void>;
    isRestaurantSaved: (restaurantId: string) => boolean;
    isLoading: boolean;
}

export const SavedRestaurantsContext = createContext<SavedRestaurantsContextType>({
    savedRestaurants: [],
    saveRestaurant: async () => {},
    unsaveRestaurant: async () => {},
    isRestaurantSaved: () => false,
    isLoading: true,
});

export function useSavedRestaurants() {
    const context = useContext(SavedRestaurantsContext);
    if (!context) {
        throw new Error('useSavedRestaurants must be used within SavedRestaurantsProvider');
    }
    return context;
}

export default function SavedRestaurantsProvider({ children }: PropsWithChildren) {
    const [savedRestaurants, setSavedRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved restaurants from AsyncStorage on mount
    useEffect(() => {
        loadSavedRestaurants();
    }, []);

    async function loadSavedRestaurants() {
        try {
            const saved = await AsyncStorage.getItem(SAVED_RESTAURANTS_KEY);
            if (saved) {
                setSavedRestaurants(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading saved restaurants:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function saveRestaurant(restaurant: Restaurant) {
        try {
            // Check if already saved
            const isAlreadySaved = savedRestaurants.some((r) => r.id === restaurant.id);
            if (isAlreadySaved) {
                return;
            }

            // Add to beginning of list (most recent first)
            const updated = [restaurant, ...savedRestaurants];
            setSavedRestaurants(updated);
            await AsyncStorage.setItem(SAVED_RESTAURANTS_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error saving restaurant:', error);
        }
    }

    async function unsaveRestaurant(restaurantId: string) {
        try {
            const updated = savedRestaurants.filter((r) => r.id !== restaurantId);
            setSavedRestaurants(updated);
            await AsyncStorage.setItem(SAVED_RESTAURANTS_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error unsaving restaurant:', error);
        }
    }

    function isRestaurantSaved(restaurantId: string): boolean {
        return savedRestaurants.some((r) => r.id === restaurantId);
    }

    return (
        <SavedRestaurantsContext.Provider
            value={ {
                savedRestaurants,
                saveRestaurant,
                unsaveRestaurant,
                isRestaurantSaved,
                isLoading,
            } }
        >
            { children }
        </SavedRestaurantsContext.Provider>
    );
}
